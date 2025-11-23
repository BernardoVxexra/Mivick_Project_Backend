import { getCurrentDateTime } from "../utils/dateTime.js";
import { IoTModel } from "../models/IoTModel.js";
import { getDbConnection } from "../database/db.js";
import { detectarVeiculosBuffer } from "../services/detectarVeiculos.js";

export class IoTController {
  static async registrarDispositivo(req, res) {
    try {
      const { nome } = req.body;
      const id_cliente = req.user.id_cliente;
      const db = await getDbConnection();
      const result = await db.run(
        `INSERT INTO Dispositivo (nome, condicao, id_cliente)
         VALUES (?, 'ativo', ?)`,
        [nome || "Meu dispositivo", id_cliente]
      );
      return res.json({ ok: true, id_dispositivo: result.lastID });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Erro ao registrar dispositivo" });
    }
  }

  static async receiveData(req, res) {
    try {
      const {
        id_dispositivo,
        distancia,
        impacto,
        movimentacao,
        acidente_identificado,
        foto_base64,
        ble_log,
        wifi_ssid,
        wifi_senha,
        ws_log
      } = req.body;

      if (!id_dispositivo)
        return res.status(400).json({ error: "id_dispositivo é obrigatório" });

      // SALVAR LOGS
      if (ble_log) await IoTModel.saveBLELog({ mensagem: ble_log, id_dispositivo });
      if (ws_log) await IoTModel.saveWSLog({ mensagem: ws_log, id_dispositivo });

      if (wifi_ssid && wifi_senha) {
        await IoTModel.saveWifiEnvio({ ssid: wifi_ssid, senha: wifi_senha, id_dispositivo });
      }

      const db = await getDbConnection();
      let id_leitura = null;
      let leituraCreatedNow = false;

      // 1) Se vier dados de sensor (distancia/impacto/movimentacao) -> cria Leitura
      const sensorPresent = (distancia !== undefined && distancia !== null)
                          || (impacto !== undefined && impacto !== null)
                          || (movimentacao !== undefined && movimentacao !== null);

      if (sensorPresent) {
        id_leitura = await IoTModel.createLeitura({
          id_dispositivo,
          distancia: distancia ?? null,
          impacto: impacto ?? null,
          movimentacao: movimentacao ?? null,
          acidente_identificado: !!acidente_identificado
        });
        leituraCreatedNow = true;
      }

      // 2) Se veio foto e ainda não temos leitura nessa req -> cria leitura "FOTO" para associar
      if (foto_base64 && !id_leitura) {
        id_leitura = await IoTModel.createLeitura({
          id_dispositivo,
          distancia: null,
          impacto: null,
          movimentacao: movimentacao ?? "FOTO",
          acidente_identificado: false
        });
        leituraCreatedNow = true;
      }

      // 3) Salvar foto (se houver) ligada à leitura criada/acessível
     if (foto_base64 && id_leitura) {

  const buffer = Buffer.from(foto_base64, "base64");
  const id_foto = await IoTModel.createFoto({ imageBuffer: buffer, id_leitura });

  // 🔍 chama detector e obtém quantidade
  const qtd = await detectarVeiculosBuffer(buffer);

  // se existe alerta e for acidente, vincula no alerta
  let id_alerta_atual = null;

  const alertaAtual = await db.get(`
    SELECT id_alerta FROM Alerta
    WHERE id_leitura = ?
    ORDER BY id_alerta DESC LIMIT 1
  `, [id_leitura]);

  if (alertaAtual) id_alerta_atual = alertaAtual.id_alerta;

  // 💾 salva o resultado
  await IoTModel.saveVeiculoDetectado({
    id_leitura,
    id_alerta: id_alerta_atual,
    qtd_veiculos: qtd
  });

  console.log("🚗 Análise concluída, veículos detectados:", qtd);
}


      // 4) Criar alerta (se for acidente_identificado ou se movimentacao for explicitamente um ALERTA)
      // DEDUP: evita criar múltiplos alertas iguais num curto intervalo
      if (acidente_identificado || (movimentacao && String(movimentacao).includes("POSSIVEL_ACIDENTE") || String(movimentacao).includes("ACIDENTE"))) {

        // define código e descrição
        const codigo = (movimentacao === "POSSIVEL_ACIDENTE" || acidente_identificado && movimentacao === "POSSIVEL_ACIDENTE") ? "P1" : "A1";
        const descricao = codigo === "P1" ? "Possível acidente detectado" : "Acidente confirmado";

        // buscar contato padrão do cliente (se houver)
        const contato = await db.get(`
          SELECT id_contato FROM Contato
          WHERE id_cliente = (SELECT id_cliente FROM Dispositivo WHERE id_dispositivo = ?)
          LIMIT 1
        `, [id_dispositivo]);
        const id_contato = contato ? contato.id_contato : null;
// busca leitura mais recente COM FOTO
const leituraComFoto = await db.get(`
  SELECT L.id_leitura
  FROM Leitura L
  JOIN Foto F ON F.id_leitura = L.id_leitura
  WHERE L.id_dispositivo = ?
  ORDER BY L.id_leitura DESC
  LIMIT 1
`, [id_dispositivo]);

// se existe leitura com foto → usa ela
if (leituraComFoto) {
  id_leitura = leituraComFoto.id_leitura;
}

        // DEDUP BY (codigo + id_dispositivo) WITHIN 10s OR if same id_leitura already linked
        const ultimo = await db.get(`
          SELECT id_alerta, data_hora, id_leitura FROM Alerta
          WHERE codigo = ? 
            AND (id_leitura = ? OR id_leitura IS NULL OR id_leitura IS NOT NULL)
            AND id_alerta = (SELECT id_alerta FROM Alerta
                             WHERE codigo = ? 
                               AND id_alerta IS NOT NULL
                             ORDER BY id_alerta DESC LIMIT 1)
        `, [codigo, id_leitura, codigo]);

        // If we have a last alert, check time difference or same leitura
        let allowCreate = true;
        if (ultimo) {
          // if last alert is linked to same leitura => skip
          if (ultimo.id_leitura && id_leitura && ultimo.id_leitura === id_leitura) {
            console.log("⛔ Alerta já vinculado a mesma leitura — ignorando.");
            allowCreate = false;
          } else if (ultimo.data_hora) {
            const agora = new Date();
            const anterior = new Date(ultimo.data_hora);
            const diffSeg = (agora.getTime() - anterior.getTime()) / 1000;
            if (diffSeg < 10) { // janela 10s
              console.log("⛔ ALERTA DUPLICADO IGNORADO (menos de 10s)");
              allowCreate = false;
            }
          }
        }

        if (allowCreate) {
          // criar alerta apontando para a leitura (se existir)
          await IoTModel.createAlerta({
            descricao,
            codigo,
            id_contato,
            id_leitura: id_leitura ?? null
          });
        }
      }

      return res.json({ ok: true });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  static async listarWifi(req, res) {
    try {
      const { id_dispositivo } = req.params;
      const wifiList = await IoTModel.getWifiList(id_dispositivo);
      return res.json({ ok: true, lista: wifiList });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ ok: false, error: "Erro ao listar Wi-Fi" });
    }
  }

  static async historicoCompleto(req, res) {
    try {
      const { id_dispositivo } = req.params;
      const db = await getDbConnection();

      // Buscar alertas do dispositivo - aqui assumimos que Alerta.id_leitura referencia Leitura.id_leitura
      const alertas = await db.all(
        `SELECT A.*, 
                C.nome AS contato_nome, 
                C.telefone AS contato_telefone,
                L.data_hora AS leitura_data,
                L.id_leitura
         FROM Alerta A
         LEFT JOIN Contato C ON C.id_contato = A.id_contato
         LEFT JOIN Leitura L ON L.id_leitura = A.id_leitura
         WHERE (L.id_dispositivo = ? OR A.id_leitura IS NULL)
         ORDER BY A.id_alerta DESC`,
        [id_dispositivo]
      );

      // Anexar foto para cada alerta (foto da leitura vinculada)
      for (let alerta of alertas) {
        if (alerta.id_leitura) {
          const foto = await db.get(
            `SELECT image FROM Foto WHERE id_leitura = ? ORDER BY id_image DESC LIMIT 1`,
            [alerta.id_leitura]
          );
          alerta.foto = foto ? foto.image.toString("base64") : null;
        } else {
          alerta.foto = null;
        }
      }

      // Última leitura do dispositivo
      const leitura = await db.get(
        `SELECT * FROM Leitura WHERE id_dispositivo = ? ORDER BY id_leitura DESC LIMIT 1`,
        [id_dispositivo]
      );

      let fotoLeitura = null;
      if (leitura) {
        const f = await db.get(
          `SELECT image FROM Foto WHERE id_leitura = ? ORDER BY id_image DESC LIMIT 1`,
          [leitura.id_leitura]
        );
        fotoLeitura = f ? f.image.toString("base64") : null;
      }

      const logsBLE = await db.all(
        `SELECT * FROM LogBLE WHERE id_dispositivo = ? ORDER BY id_log DESC LIMIT 20`,
        [id_dispositivo]
      );
      const logsWS = await db.all(
        `SELECT * FROM LogWS WHERE id_dispositivo = ? ORDER BY id_log DESC LIMIT 20`,
        [id_dispositivo]
      );

      return res.json({
        ok: true,
        alerta: alertas,
        leitura,
        foto: fotoLeitura,
        logsBLE,
        logsWS
      });

    } catch (e) {
      console.log(e);
      res.status(500).json({ ok: false, error: "Erro no histórico" });
    }
  }
}
