from flask import Flask, render_template, jsonify
import pandas as pd
import os
import logging

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Route for the main page
@app.route('/')
def index():
    return render_template('index.html')

# Route to load CSV data
@app.route('/load_csv', methods=['GET'])
def load_csv():
    try:
        csv_path = os.path.join(os.path.dirname(__file__), 'db.csv')
        app.logger.debug(f"CSV path: {csv_path}")
        if os.path.exists(csv_path):
            app.logger.debug("CSV file exists")
            # Try reading the CSV with ISO-8859-1 encoding
            df = pd.read_csv(csv_path, encoding='ISO-8859-1')
            app.logger.debug(f"CSV DataFrame head: \n{df.head()}")
            data = df.to_dict(orient='records')
            columns = df.columns.tolist()
            app.logger.debug(f"Data columns: {columns}")
            return jsonify({'data': data, 'columns': columns})
        app.logger.error("File not found")
        return jsonify({'error': 'File not found'}), 400
    except Exception as e:
        app.logger.exception("Failed to load CSV")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
