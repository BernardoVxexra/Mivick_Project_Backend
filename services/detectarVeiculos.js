import axios from "axios";

export async function detectarVeiculosBuffer(imageBuffer) {
    const orangePiURL = "http://10.116.216.246:5000/detect";


  const MAX_RETRY = 3; // tenta até 3 vezes
  const TIMEOUT = 3000; // 3 segundos

  for (let tentativa = 1; tentativa <= MAX_RETRY; tentativa++) {
    try {
      console.log(`Tentando detecção (tentativa ${tentativa}/${MAX_RETRY})...`);

      const resp = await axios.post(
        orangePiURL,
        imageBuffer,
        {
          headers: { "Content-Type": "application/octet-stream" },
          timeout: TIMEOUT
        }
      );

      return resp.data.qtd || 0;

    } catch (err) {
      console.log(`Falha na tentativa ${tentativa}:`, err.message);

      // se não for a última tentativa, espera e tenta de novo
      if (tentativa < MAX_RETRY) {
        await new Promise((r) => setTimeout(r, 1000)); // espera 1s
      }
    }
  }

  console.log("detectarVeiculosBuffer: todas as tentativas falharam!");
  return 0; // se tudo falhar, retorna 0 veículos
}



/*

 detect_server.py

from flask import Flask, request, jsonify
import cv2
import numpy as np
import subprocess

app = Flask(__name__)

@app.route("/detect", methods=["POST"])
def detect():
    try:
        # Recebe binário
        img_bytes = request.data

        # Salva temporário
        temp_path = "/tmp/img_detect.jpg"
        with open(temp_path, "wb") as f:
            f.write(img_bytes)

        # Executa seu script de detecção
        result = subprocess.check_output(["python3", "detect_cars.py", temp_path]).decode()

        # Extrai a quantidade
        import re
        match = re.search(r"Veículos detectados:\s+(\d+)", result)
        qtd = int(match.group(1)) if match else 0

        return jsonify({ "ok": True, "qtd": qtd })

    except Exception as e:
        return jsonify({ "ok": False, "error": str(e), "qtd": 0 })

app.run(host="0.0.0.0", port=5000)
*/




/* rodar o cod de detecção na inicialização do orange pi

cod pra criar o arquivo de serviço:
sudo nano /etc/systemd/system/detectserver.service

cod do arquivo:

[Unit]
Description=Servico de detecao de veiculos com Python e OpenCV
After=network.target

[Service]
User=root
WorkingDirectory=/root
ExecStart=/usr/bin/python3 /root/detect_server.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target



Atualizar serviços e habilitar:

sudo systemctl daemon-reload
sudo systemctl enable detectserver
sudo systemctl start detectserver


Verificar se está rodando:]

systemctl status detectserver

*/