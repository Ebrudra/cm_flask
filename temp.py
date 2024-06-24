@app.route('/load_campaigns', methods=['GET'])
def load_campaigns():
    try:
        csv_path = os.path.join(os.path.dirname(__file__), 'db.csv')
        app.logger.debug(f"CSV path: {csv_path}")
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path, encoding='ISO-8859-1')
            campaign_counts = df.groupby('Campaign').agg({
                'clean_name': 'nunique',
                'clean_name': lambda x: list(x.unique())
            }).reset_index()
            campaign_counts.columns = ['Campaign', 'UniqueCleanNames', 'clean_names']
            data = campaign_counts.to_dict(orient='records')
            return jsonify({'data': data})
        else:
            app.logger.error("File not found")
            return jsonify({'error': 'File not found'}), 400
    except Exception as e:
        app.logger.exception("Failed to load campaign data")
        return jsonify({'error': str(e)}), 500
