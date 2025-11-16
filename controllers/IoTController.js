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

}
