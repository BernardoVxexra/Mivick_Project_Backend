import { IoTModel } from "../models/IoTModel.js";
import { getCurrentDateTime } from "../utils/dateTime.js";

export class IoTController {

  //  Dispositivo envia leitura
  static async receiveData(req, res) {
    try {
      const { id_dispositivo, movimento, distancia, impacto, imageBase64 } = req.body;

      if (!id_dispositivo) {
        return res.status(400).json({ error: "ID do dispositivo é obrigatório" });
      }

      // Lógica MDI: sensores ativados?
      const sensoresAtivos = [movimento, distancia, impacto].filter(Boolean).length;

      let acidente_identificado = false;
      let suspeita = false;

      if (sensoresAtivos === 3) {
        acidente_identificado = true;
      } else if (sensoresAtivos === 2) {
        suspeita = true;
      }

      // Cria registro da leitura
      await IoTModel.createLeitura({
        id_dispositivo,
        distancia,
        impacto,
        movimentacao: movimento,
        acidente_identificado
      });

      // Caso suspeita → salva imagem (foto de verificação)
      if (suspeita && imageBase64) {
        const buffer = Buffer.from(imageBase64, 'base64');
        const data_hora = getCurrentDateTime();

        // Obtém a última leitura para vincular a foto
        const leituras = await IoTModel.findLeiturasByDispositivo(id_dispositivo);
        const ultimaLeitura = leituras[leituras.length - 1];

        await IoTModel.createFoto({
          imageBuffer: buffer,
          data_hora,
          id_leitura: ultimaLeitura.id_leitura
        });
      }

      // Caso acidente confirmado → cria alerta para os contatos
      if (acidente_identificado) {
        const descricao = "Acidente detectado pelo sistema MDI!";
        const codigo = "ALR-" + Math.floor(100000 + Math.random() * 900000);

        // Busca todos os contatos do cliente dono do dispositivo
        const dispositivos = await IoTModel.findDispositivosByCliente(req.user.id_cliente);
        const dispositivo = dispositivos.find(d => d.id_dispositivo === id_dispositivo);

        if (dispositivo) {
          const contatos = await IoTModel.findAlertasByClient(dispositivo.id_cliente);
          for (const contato of contatos) {
            await IoTModel.createAlerta({
              descricao,
              codigo,
              id_contato: contato.id_contato
            });

            // (Testes) envio real de SMS ou push notification
            console.log(`Alerta enviado para ${contato.nome}: ${descricao}`);
          }
        }
      }

      res.status(201).json({
        message: acidente_identificado
          ? "Acidente confirmado! Alerta enviado."
          : suspeita
          ? "Atividade suspeita detectada — imagem salva para verificação."
          : "Leitura registrada com sucesso."
      });

    } catch (err) {
      console.error("Erro ao processar leitura:", err);
      res.status(500).json({ error: "Erro interno ao processar leitura" });
    }
  }
}
