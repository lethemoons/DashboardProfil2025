/**
 * Seeded random number generator
 */
function random(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Standardize features by removing the mean and scaling to unit variance (z-score)
 */
export function standardize(data: number[][]): { scaled: number[][], means: number[], stds: number[] } {
  if (data.length === 0) return { scaled: [], means: [], stds: [] };
  const numFeatures = data[0].length;
  const numSamples = data.length;
  
  const means = new Array(numFeatures).fill(0);
  for (let i = 0; i < numSamples; i++) {
    for (let j = 0; j < numFeatures; j++) {
      means[j] += data[i][j];
    }
  }
  for (let j = 0; j < numFeatures; j++) means[j] /= numSamples;
  
  const stds = new Array(numFeatures).fill(0);
  for (let i = 0; i < numSamples; i++) {
    for (let j = 0; j < numFeatures; j++) {
      stds[j] += Math.pow(data[i][j] - means[j], 2);
    }
  }
  for (let j = 0; j < numFeatures; j++) {
    stds[j] = Math.sqrt(stds[j] / (numSamples - 1)) || 1; // avoid division by zero
  }
  
  const scaled = data.map(row => row.map((val, j) => (val - means[j]) / stds[j]));
  return { scaled, means, stds };
}

/**
 * Euclidean distance squared between two points
 */
function distanceSq(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0);
}

/**
 * K-Means clustering (K=3)
 */
export function kmeans(data: number[][], k = 3, maxIterations = 100, seed = 42): { clusters: number[], centroids: number[][] } {
  if (data.length === 0) return { clusters: [], centroids: [] };
  
  // Initialize centroids randomly but deterministically
  let s = seed;
  let centroids = [];
  const indices = new Set<number>();
  while (centroids.length < k && centroids.length < data.length) {
    const idx = Math.floor(random(s++) * data.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      centroids.push([...data[idx]]);
    }
  }
  
  let clusters = new Array(data.length).fill(0);
  let changed = true;
  let iterations = 0;
  
  while (changed && iterations < maxIterations) {
    changed = false;
    
    // Assign to nearest centroid
    for (let i = 0; i < data.length; i++) {
      let minDist = Infinity;
      let minIndex = 0;
      for (let j = 0; j < k; j++) {
        const d = distanceSq(data[i], centroids[j]);
        if (d < minDist) {
          minDist = d;
          minIndex = j;
        }
      }
      if (clusters[i] !== minIndex) {
        clusters[i] = minIndex;
        changed = true;
      }
    }
    
    // Recompute centroids
    const newCentroids = new Array(k).fill(0).map(() => new Array(data[0].length).fill(0));
    const counts = new Array(k).fill(0);
    
    for (let i = 0; i < data.length; i++) {
      const cluster = clusters[i];
      counts[cluster]++;
      for (let j = 0; j < data[0].length; j++) {
        newCentroids[cluster][j] += data[i][j];
      }
    }
    
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        for (let l = 0; l < data[0].length; l++) {
          newCentroids[j][l] /= counts[j];
        }
      } else {
        // Handle empty cluster: re-initialize to a random point
        newCentroids[j] = [...data[Math.floor(random(s++) * data.length)]];
      }
    }
    centroids = newCentroids;
    iterations++;
  }
  
  return { clusters, centroids };
}

export type RiskDirection = 1 | -1; // 1 = higher value means higher risk, -1 = higher value means lower risk

/**
 * Assigns 'Rendah', 'Sedang', 'Tinggi' risk labels to clusters based on their centroids and variables' directions.
 */
export function evaluateRiskClusters(centroids: number[][], directions: RiskDirection[]): { clusterId: number, riskLevel: 'Rendah' | 'Sedang' | 'Tinggi', score: number }[] {
  // Score = sum of (centroid[i] * direction[i])
  // Standardized centroids mean values are around 0.
  // Higher score = higher risk
  const scores = centroids.map((centroid, idx) => {
    const score = centroid.reduce((sum, val, i) => sum + (val * directions[i]), 0);
    return { clusterId: idx, score };
  });
  
  scores.sort((a, b) => a.score - b.score); // Ascending order
  
  const results = [];
  if (scores.length >= 1) results.push({ clusterId: scores[0].clusterId, riskLevel: 'Rendah' as const, score: scores[0].score });
  if (scores.length >= 2) results.push({ clusterId: scores[1].clusterId, riskLevel: 'Sedang' as const, score: scores[1].score });
  if (scores.length >= 3) results.push({ clusterId: scores[2].clusterId, riskLevel: 'Tinggi' as const, score: scores[2].score });
  
  // Sort back by clusterId
  return results.sort((a, b) => a.clusterId - b.clusterId);
}
