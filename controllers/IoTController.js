import { getCurrentDateTime } from "../utils/dateTime.js";
import { IoTModel } from "../models/IoTModel.js";
import { getDbConnection } from "../database/db.js";

export class IoTController {
static async registrarDispositivo(req, res) {
  try {
    const { nome } = req.body;
    const id_cliente = req.user.id_cliente; // vem do token JWT

    const db = await getDbConnection();

    const result = await db.run(
      `INSERT INTO Dispositivo (nome, condicao, id_cliente)
       VALUES (?, 'ativo', ?)`,
      [nome || "Meu dispositivo", id_cliente]
    );

    return res.json({
      ok: true,
      id_dispositivo: result.lastID
    });

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

      // SALVAR LOG BLE
      if (ble_log) {
        await IoTModel.saveBLELog({ mensagem: ble_log, id_dispositivo });
      }

      // SALVAR LOG WS
      if (ws_log) {
        await IoTModel.saveWSLog({ mensagem: ws_log, id_dispositivo });
      }

      // SALVAR ENVIO DE WI-FI
      if (wifi_ssid && wifi_senha) {
        await IoTModel.saveWifiEnvio({
          ssid: wifi_ssid,
          senha: wifi_senha,
          id_dispositivo
        });
      }

      // SALVAR SENSOR
      if (distancia || impacto || movimentacao !== undefined) {
        await IoTModel.createLeitura({
          id_dispositivo,
          distancia,
          impacto,
          movimentacao,
          acidente_identificado: !!acidente_identificado
        });

        const leitura = await IoTModel.getLastLeitura(id_dispositivo);

        // SALVAR FOTO
        if (foto_base64) {
          const buffer = Buffer.from(foto_base64, "base64");
          await IoTModel.createFoto({
            imageBuffer: buffer,
            id_leitura: leitura.id_leitura
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

    // Última leitura + foto
    const leitura = await db.get(
      `SELECT * FROM Leitura WHERE id_dispositivo = ? ORDER BY id_leitura DESC LIMIT 1`,
      [id_dispositivo]
    );

    let foto = null;
    if (leitura) {
      foto = await db.get(
        `SELECT image FROM Foto WHERE id_leitura = ? ORDER BY id_image DESC LIMIT 1`,
        [leitura.id_leitura]
      );
    }

    // Logs BLE
    const logsBLE = await db.all(
      `SELECT * FROM LogBLE WHERE id_dispositivo = ? ORDER BY id_log DESC LIMIT 20`,
      [id_dispositivo]
    );

    // Logs WS
    const logsWS = await db.all(
      `SELECT * FROM LogWS WHERE id_dispositivo = ? ORDER BY id_log DESC LIMIT 20`,
      [id_dispositivo]
    );

    // Último alerta
    const alerta = await db.get(
      `SELECT A.*, C.nome AS contato_nome, C.telefone AS contato_telefone
       FROM Alerta A 
       LEFT JOIN Contato C ON C.id_contato = A.id_contato
       ORDER BY id_alerta DESC LIMIT 1`
    );

    return res.json({
      ok: true,
      leitura,
      foto: foto ? foto.image.toString("base64") : null,
      logsBLE,
      logsWS,
      alerta
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ ok: false, error: "Erro no histórico" });
  }
}

}
