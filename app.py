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

# Route for the about page
@app.route('/about')
def about():
    return render_template('about.html')

# Route for the campaigns page
@app.route('/campaigns')
def campaigns():
    return render_template('campaigns.html')

# Route for the blog page
@app.route('/blog')
def blog():
    return render_template('blog.html')

# Route for the add page
@app.route('/add')
def add():
    return render_template('add.html')

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
        else:
            app.logger.error("File not found")
            return jsonify({'error': 'File not found'}), 400
    except Exception as e:
        app.logger.exception("Failed to load CSV")
        return jsonify({'error': str(e)}), 500

# Route to load campaign data
@app.route('/load_campaigns', methods=['GET'])
def load_campaigns():
    try:
        csv_path = os.path.join(os.path.dirname(__file__), 'db.csv')
        app.logger.debug(f"CSV path: {csv_path}")
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path, encoding='ISO-8859-1')
            campaign_counts = df.groupby('Campaign')['clean_name'].nunique().reset_index()
            campaign_counts.columns = ['Campaign', 'UniqueCleanNames']
            data = campaign_counts.to_dict(orient='records')
            return jsonify({'data': data})
        else:
            app.logger.error("File not found")
            return jsonify({'error': 'File not found'}), 400
    except Exception as e:
        app.logger.exception("Failed to load campaign data")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
