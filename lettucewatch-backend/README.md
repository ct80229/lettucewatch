Set up:
1. git pull https://github.com/ct80229/lettucewatch.git main
2. Navigate to directory. python -m venv venv
3. source venv/bin/activate
4. pip install -r requirements.txt
Run instructions:
*activate venv w: source venv/bin/activate
1. In lettucewatch-backend: 
1a. source venv/bin/activate
1b. uvicorn app.main:app --reload 
2. In lettucewatch-frontend: npm run dev

