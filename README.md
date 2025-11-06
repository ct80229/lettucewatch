Set up:
1. git pull https://github.com/ct80229/lettucewatch.git main
2. Navigate to directory. python -m venv venv
3. source venv/bin/activate
4. pip install -r requirements.txt
Run instructions:
1. In lettucewatch-backend: 
  source venv/bin/activate
  uvicorn app.main:app --reload 
2. In lettucewatch-frontend: npm run dev

