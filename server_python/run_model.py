import json
import logging
import re
import numpy as np
import pickle
from http.server import BaseHTTPRequestHandler, HTTPServer

# load model 1
scale_data1 = np.load('./data_mean_std_1.npy') # age, restingbp, cholesterol, maxhr
with open('./model1_svc.pkl', 'rb') as f:
    model1 = pickle.load(f)
    

# load model 2
scale_data2 = np.load('./data_mean_std_2.npy')
with open('./model2_dtree.pkl', 'rb') as f:
    model2 = pickle.load(f)
#x_test1 = np.array([52, 1, 3, 118, 186, 0, 190, 0])
#x_test2 = np.array([1, 43, 1, 43, 0, 0, 0, 0, 226, 115, 85.5, 27.57, 75, 75])



class HTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if re.search('/api/model1/*', self.path):
     
            # Lấy dữ liệu từ request
            length = int(self.headers.get('content-length'))
            data = self.rfile.read(length).decode('utf8')
            logging.info("add record %s: %s",  data)
            data = json.loads(data)
            
            
            # Scale lại dữ liệu (Stadard Scale)
            x_test = np.array(data['data_test'])
            print("Data test: ", x_test)
            x_test[0] = (x_test[0] - scale_data1[0][0])/scale_data1[0][1]  # age
            x_test[3] = (x_test[3] - scale_data1[1][0])/scale_data1[1][1]  # restingbp
            x_test[4] = (x_test[4] - scale_data1[2][0])/scale_data1[2][1]  # cholesterol
            x_test[6] = (x_test[6] - scale_data1[3][0])/scale_data1[3][1]  # maxhr
            x_test = x_test.reshape(1, -1)
            
            # Dự đoán bằng mô hình ML
            # result = model1.predict(x_test)
            result = model1.predict_proba(x_test)  # Ví dụ: Thực hiện dự đoán
            print("Result predict: ",result)
            
            # Chuyển kết quả sang json
            response = {}
            response["alert"] = result[0].tolist()
            json_response = json.dumps(response)

            # Gửi response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json_response.encode('utf-8'))
        elif re.search('/api/model2/*', self.path):
            
            # Lấy dữ liệu từ request
            length = int(self.headers.get('content-length'))
            data = self.rfile.read(length).decode('utf8')
            logging.info("add record %s: %s",  data)
            data = json.loads(data)
            
            
            # Scale lại dữ liệu
            x_test = np.array(data['data_test'])
            print("Data test: ", x_test)
            for i in range(x_test.size):
                x_test[i] = (x_test[i] - scale_data2[i][0])/scale_data2[i][1]
            x_test = x_test.reshape(1, -1)
            
            
            # Dự đoán bằng mô hình ML
            # result = model2.predict(x_test)
            result = model2.predict_proba(x_test)  # Ví dụ: Thực hiện dự đoán
            print("Result predict: ",result)
            
            # chuyển kết quả sang json
            response = {}
            response["alert"] = result[0].tolist()
            json_response = json.dumps(response)

            # Gửi response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json_response.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

        
if __name__ == '__main__':
    server = HTTPServer(('localhost', 8000), HTTPRequestHandler)
    logging.info('Starting httpd...\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    server.server_close()
    logging.info('Stopping httpd...\n')