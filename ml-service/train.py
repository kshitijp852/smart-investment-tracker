
# Train a dummy model for demo purposes
from sklearn.ensemble import RandomForestClassifier
import numpy as np
import joblib

# Synthetic features: [cagr, volatility, sharpe]
X = np.random.rand(200,3)
y = (X[:,2] > 0.2).astype(int)  # pretend sharpe>0.2 -> good
model = RandomForestClassifier(n_estimators=50)
model.fit(X,y)
joblib.dump(model, 'model.joblib')
print('trained model saved as model.joblib')
