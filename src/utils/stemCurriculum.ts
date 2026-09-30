import { STEMLab } from "../types";

export const STEM_LABS: STEMLab[] = [
  {
    id: "stem-physics-projectile",
    title: "Lab 1: Projectile Motion & Ballistic Trajectory",
    discipline: "physics",
    difficulty: "Beginner",
    description:
      "Calculate the maximum height, flight time, and total horizontal range of a projectile launched at initial velocity v0 and angle theta under Earth's gravitational acceleration (g = 9.8 m/s²).",
    theoryFormula:
      "Flight Time: T = (2 * v0 * sin(θ)) / g\nMax Height: H = (v0 * sin(θ))² / (2 * g)\nTotal Range: R = (v0² * sin(2θ)) / g",
    learningObjectives: [
      "Understand 2D kinematic vector decomposition into horizontal and vertical components",
      "Model how launch angles affect range and apex using trigonometric functions",
      "Format scientific float outputs to 2 decimal places for real-world laboratory precision",
    ],
    starterCode: {
      python: `# STEM Physics Lab: Projectile Motion Simulation
import math

def calculate_trajectory(v0: float, angle_degrees: float, g: float = 9.8):
    """
    Computes projectile kinematics.
    v0: launch velocity in m/s
    angle_degrees: elevation angle in degrees
    returns: dict with time_of_flight, max_height, and horizontal_range
    """
    rad = math.radians(angle_degrees)
    
    # Complete the kinematic equations below:
    # 1. Total flight time (seconds)
    time_of_flight = (2 * v0 * math.sin(rad)) / g
    
    # 2. Maximum apex height (meters)
    max_height = (v0 * math.sin(rad)) ** 2 / (2 * g)
    
    # 3. Horizontal range (meters)
    horizontal_range = (v0 ** 2 * math.sin(2 * rad)) / g
    
    return {
        "flight_time": round(time_of_flight, 2),
        "max_height": round(max_height, 2),
        "range": round(horizontal_range, 2)
    }

if __name__ == "__main__":
    test_v0 = 25.0 # m/s
    test_angle = 45.0 # degrees
    result = calculate_trajectory(test_v0, test_angle)
    print(f"Launch: {test_v0} m/s at {test_angle}°")
    print(f"Flight Time: {result['flight_time']} s")
    print(f"Max Height: {result['max_height']} m")
    print(f"Total Range: {result['range']} m")
`,
      javascript: `// STEM Physics Lab: Projectile Motion Simulation
function calculateTrajectory(v0, angleDegrees, g = 9.8) {
  const rad = (angleDegrees * Math.PI) / 180;
  const timeOfFlight = (2 * v0 * Math.sin(rad)) / g;
  const maxHeight = Math.pow(v0 * Math.sin(rad), 2) / (2 * g);
  const horizontalRange = (Math.pow(v0, 2) * Math.sin(2 * rad)) / g;

  return {
    flight_time: Number(timeOfFlight.toFixed(2)),
    max_height: Number(maxHeight.toFixed(2)),
    range: Number(horizontalRange.toFixed(2))
  };
}

const v0 = 25.0;
const angle = 45.0;
const result = calculateTrajectory(v0, angle);
console.log(\`Launch: \${v0} m/s at \${angle}°\`);
console.log(\`Flight Time: \${result.flight_time} s\`);
console.log(\`Max Height: \${result.max_height} m\`);
console.log(\`Total Range: \${result.range} m\`);
`,
    },
    testCases: [
      {
        id: "test-1",
        description: "Optimal 45° angle launch at 25 m/s",
        input: "v0=25, angle=45",
        expectedOutput: "Flight Time: 3.61 s\nMax Height: 15.94 m\nTotal Range: 63.78 m",
      },
      {
        id: "test-2",
        description: "High mortar 60° angle launch at 30 m/s",
        input: "v0=30, angle=60",
        expectedOutput: "Flight Time: 5.30 s\nMax Height: 34.44 m\nTotal Range: 79.53 m",
      },
      {
        id: "test-3",
        description: "Low skim 30° angle launch at 20 m/s",
        input: "v0=20, angle=30",
        expectedOutput: "Flight Time: 2.04 s\nMax Height: 5.10 m\nTotal Range: 35.35 m",
      },
    ],
    simulationType: "projectile",
    hints: [
      "Convert degrees to radians before calling trigonometric functions (math.radians in Python, or angle * Math.PI / 180 in JS).",
      "Check that your exponentiation uses ** in Python and Math.pow in JS.",
      "Round your results using round(val, 2) to match standard engineering precision.",
    ],
  },
  {
    id: "stem-math-riemann",
    title: "Lab 2: Numerical Calculus & Riemann Definite Integrals",
    discipline: "mathematics",
    difficulty: "Intermediate",
    description:
      "Implement the Midpoint Riemann Sum to approximate the definite integral of a function f(x) = x² + 2x between lower bound a and upper bound b using n subintervals.",
    theoryFormula:
      "Δx = (b - a) / n\nx_mid = a + (i + 0.5) * Δx\nIntegral ≈ Σ [f(x_mid) * Δx] from i = 0 to n - 1",
    learningObjectives: [
      "Bridge symbolic calculus with computational approximation methods",
      "Understand how decreasing partition width Δx reduces approximation error",
      "Analyze algorithmic time complexity O(n) for numerical quadrature",
    ],
    starterCode: {
      python: `# STEM Mathematics Lab: Riemann Numerical Integration
def f(x: float) -> float:
    # Function to integrate: f(x) = x^2 + 2x
    return x**2 + 2*x

def riemann_integral(a: float, b: float, n: int = 1000) -> float:
    """
    Approximates definite integral of f(x) from a to b using Midpoint Riemann sum.
    """
    dx = (b - a) / n
    total_area = 0.0
    
    for i in range(n):
        x_mid = a + (i + 0.5) * dx
        total_area += f(x_mid) * dx
        
    return round(total_area, 4)

if __name__ == "__main__":
    a, b = 0.0, 3.0
    approx = riemann_integral(a, b, n=1000)
    # Exact analytical integral of (x^2 + 2x) from 0 to 3 is:
    # [x^3/3 + x^2] from 0 to 3 = 27/3 + 9 = 18.0
    print(f"Integrating f(x) from {a} to {b} with n=1000 partitions")
    print(f"Calculated Riemann Approximation: {approx}")
    print(f"Exact Analytical Integral: 18.0")
`,
      javascript: `// STEM Mathematics Lab: Riemann Numerical Integration
function f(x) {
  return Math.pow(x, 2) + 2 * x;
}

function riemannIntegral(a, b, n = 1000) {
  const dx = (b - a) / n;
  let totalArea = 0;
  for (let i = 0; i < n; i++) {
    const xMid = a + (i + 0.5) * dx;
    totalArea += f(xMid) * dx;
  }
  return Number(totalArea.toFixed(4));
}

const a = 0.0, b = 3.0;
const approx = riemannIntegral(a, b, 1000);
console.log(\`Integrating f(x) from \${a} to \${b} with n=1000 partitions\`);
console.log(\`Calculated Riemann Approximation: \${approx}\`);
console.log("Exact Analytical Integral: 18.0");
`,
    },
    testCases: [
      {
        id: "test-riemann-1",
        description: "Integrate x² + 2x from 0 to 3 (n=1000)",
        input: "a=0, b=3, n=1000",
        expectedOutput: "Calculated Riemann Approximation: 18.0\nExact Analytical Integral: 18.0",
      },
      {
        id: "test-riemann-2",
        description: "Integrate x² + 2x from 1 to 4 (n=2000)",
        input: "a=1, b=4, n=2000",
        expectedOutput: "Calculated Riemann Approximation: 36.0\nExact Analytical Integral: 36.0",
      },
    ],
    simulationType: "riemann",
    hints: [
      "Midpoint Riemann sums sample the height of each rectangle at x_mid = a + (i + 0.5) * dx.",
      "Multiply the evaluated height f(x_mid) by width dx before summing.",
      "Check bounds: ensure you loop exactly n times from i = 0 to n-1.",
    ],
  },
  {
    id: "stem-cs-binary-search",
    title: "Lab 3: Algorithms - Binary Search & O(log N) Efficiency",
    discipline: "algorithms",
    difficulty: "Beginner",
    description:
      "Implement logarithmic divide-and-conquer binary search on a sorted dataset. Count the exact number of iterations and prove why it searches 1,000,000 items in at most 20 comparisons.",
    theoryFormula:
      "Search Space Halving: N, N/2, N/4, ... 1\nWorst-Case Comparisons: ⌊log₂(N)⌋ + 1\nTime Complexity: O(log N), Space: O(1)",
    learningObjectives: [
      "Master the 2-pointer two-sided boundary convergence pattern (low, high, mid)",
      "Avoid integer overflow when computing mid = low + (high - low) // 2",
      "Contrast O(log N) efficiency against O(N) naive linear search",
    ],
    starterCode: {
      python: `# STEM Algorithms Lab: Logarithmic Binary Search

def binary_search(arr, target):
    """
    Performs binary search on sorted list arr.
    Returns: (index_found, comparisons_count)
    """
    low = 0
    high = len(arr) - 1
    comparisons = 0
    
    while low <= high:
        comparisons += 1
        mid = (low + high) // 2
        
        if arr[mid] == target:
            return mid, comparisons
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1, comparisons

if __name__ == "__main__":
    data = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91, 104, 150]
    target_val = 56
    idx, comps = binary_search(data, target_val)
    print(f"Dataset Size: {len(data)} items")
    print(f"Target: {target_val}")
    print(f"Found at Index: {idx}")
    print(f"Comparisons Required: {comps} (vs {data.index(target_val) + 1} for Linear Search)")
`,
      javascript: `// STEM Algorithms Lab: Binary Search
function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  let comparisons = 0;

  while (low <= high) {
    comparisons++;
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) {
      return { index: mid, comparisons };
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return { index: -1, comparisons };
}

const data = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91, 104, 150];
const target = 56;
const result = binarySearch(data, target);
console.log(\`Dataset Size: \${data.length} items\`);
console.log(\`Target: \${target}\`);
console.log(\`Found at Index: \${result.index}\`);
console.log(\`Comparisons Required: \${result.comparisons}\`);
`,
    },
    testCases: [
      {
        id: "test-bs-1",
        description: "Find 56 in 13-element sorted list",
        input: "target=56",
        expectedOutput: "Target: 56\nFound at Index: 8",
      },
    ],
    simulationType: "riemann",
    hints: [
      "The input array MUST be pre-sorted for binary search to function correctly.",
      "Check condition: while low <= high (use <= not < so the single element boundary is checked).",
      "Update pointers: low = mid + 1 when arr[mid] < target, and high = mid - 1 otherwise.",
    ],
  },
];
