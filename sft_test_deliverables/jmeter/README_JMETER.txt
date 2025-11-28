JMeter test plan: create two Thread Groups for GET /api/games and POST /auth/register.
This file is a placeholder describing the plan — create a .jmx in JMeter GUI with:
- Thread Group: Users (variable), Ramp-Up (seconds), Loop Count: 1
- HTTP Request sampler: GET /api/games
- Listeners: Summary Report, Aggregate Report, and Graph Results
Run with increasing users (e.g., 1,10,50,100,200) and export metrics to CSV.
Below there's a sample CSV with fake metrics for demonstration (columns: users, avg_ms, p95_ms, throughput).