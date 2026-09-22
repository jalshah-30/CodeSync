import { SupportedLanguage, EditorTheme } from "../types";

export const SUPPORTED_LANGUAGES: Array<{ id: SupportedLanguage; name: string; extension: string }> = [
  { id: "python", name: "Python 3", extension: ".py" },
  { id: "javascript", name: "JavaScript", extension: ".js" },
  { id: "typescript", name: "TypeScript", extension: ".ts" },
  { id: "cpp", name: "C++", extension: ".cpp" },
  { id: "java", name: "Java", extension: ".java" },
  { id: "go", name: "Go", extension: ".go" },
  { id: "rust", name: "Rust", extension: ".rs" },
  { id: "html", name: "HTML5", extension: ".html" },
  { id: "css", name: "CSS3", extension: ".css" },
  { id: "sql", name: "SQL", extension: ".sql" },
  { id: "bash", name: "Bash / Shell", extension: ".sh" },
];

export const EDITOR_THEMES: Array<{ id: EditorTheme; name: string; bg: string; text: string }> = [
  { id: "vs-dark", name: "VS Dark Modern", bg: "bg-ink", text: "text-cream" },
  { id: "monokai", name: "Monokai Pro", bg: "bg-[#1B243B]", text: "text-cream" },
  { id: "dracula", name: "Dracula Official", bg: "bg-[#18213F]", text: "text-cream" },
  { id: "github-dark", name: "GitHub Dark", bg: "bg-surface", text: "text-cream" },
  { id: "solarized-dark", name: "Solarized Dark", bg: "bg-[#091536]", text: "text-cream" },
  { id: "twilight", name: "Twilight Glow", bg: "bg-[#070D29]", text: "text-cream" },
];

export const FONT_SIZES = [12, 14, 15, 16, 18, 20, 22];

export const COLLABORATOR_COLORS = [
  "#E06D53", // Terracotta
  "#E5A84B", // Warm Ochre
  "#52B788", // Mint Sage
  "#70A6FF", // Periwinkle Sky
  "#B185DB", // Soft Lavender
  "#48CAE4", // Cyan Sky
  "#F39A9D", // Soft Rose
  "#E9D8A6", // Warm Sand
];

export const STARTER_TEMPLATES: Record<SupportedLanguage, string> = {
  python: `# CodeSync - Real-Time Collaborative Workspace

def solve(arr):
    print("Executing Python algorithm...")
    evens = [x for x in arr if x % 2 == 0]
    return sorted(evens, reverse=True)

if __name__ == "__main__":
    data = [12, 5, 8, 19, 24, 3, 16]
    result = solve(data)
    print("Filtered & Sorted:", result)
`,
  javascript: `// CodeSync - Collaborative JavaScript Editor
// Test real-time execution & output sharing

function calculateStats(items) {
  const sum = items.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / items.length;
  return { sum, average: avg.toFixed(2), count: items.length };
}

const scores = [88, 92, 79, 95, 85, 100];
console.log("Team Scores:", scores);
console.log("Stats Result:", calculateStats(scores));
`,
  typescript: `// CodeSync - Real-Time TypeScript Workspace
interface TaskItem {
  id: number;
  title: string;
  status: "pending" | "completed";
}

const backlog: TaskItem[] = [
  { id: 1, title: "Initialize WebSocket engine", status: "completed" },
  { id: 2, title: "Enable real-time collaborative editing", status: "completed" },
  { id: 3, title: "Sync live cursor tracking & terminals", status: "pending" },
];

console.log("=== Active Sprint Tasks ===");
backlog.forEach((task) => {
  console.log(\`[\${task.status === "completed" ? "✓" : " "}] \${task.title}\`);
});
`,
  cpp: `// CodeSync C++ Shared Space
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> nums = {10, 20, 30, 40, 50};
    int total = std::accumulate(nums.begin(), nums.end(), 0);
    std::cout << "CodeSync C++ Execution" << std::endl;
    std::cout << "Sum of elements = " << total << std::endl;
    return 0;
}
`,
  java: `// CodeSync Java Workspace
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("CodeSync Java Engine Online!");
        List<String> features = Arrays.asList("Real-time sync", "AI debugging", "Voice chat", "Activity logs");
        for (String feat : features) {
            System.out.println("-> Feature active: " + feat);
        }
    }
}
`,
  go: `// CodeSync Go Workspace
package main

import "fmt"

func main() {
    fmt.Println("CodeSync Go Environment Started")
    team := []string{"Jal Shah", "SoftDecoders", "CodeSync"}
    for i, member := range team {
        fmt.Printf("[%d] %s\\n", i+1, member)
    }
}
`,
  rust: `// CodeSync Rust Workspace
fn main() {
    println!("CodeSync Rust Concurrency Playground");
    let numbers = vec![1, 2, 3, 4, 5];
    let squares: Vec<i32> = numbers.iter().map(|&x| x * x).collect();
    println!("Squares: {:?}", squares);
}
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodeSync Live Preview</title>
</head>
<body style="font-family: sans-serif; padding: 20px; background: #0f172a; color: white;">
  <h1>CodeSync Live Sandbox</h1>
  <p>Real-time collaborative HTML rendering with team SoftDecoders.</p>
</body>
</html>
`,
  css: `/* CodeSync Stylesheet */
.codesync-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e2e, #0f172a);
  color: #f8fafc;
  border-radius: 12px;
  padding: 2rem;
}
`,
  sql: `-- CodeSync Collaborative SQL Session
SELECT 
    user_id,
    user_name,
    COUNT(room_id) as active_rooms,
    MAX(last_active_at) as last_seen
FROM 
    codesync_collaborators
GROUP BY 
    user_id, user_name
ORDER BY 
    active_rooms DESC;
`,
  bash: `#!/bin/bash
# CodeSync Shell Runner
echo "=== CodeSync Terminal Execution ==="
echo "Operating System: $(uname -s)"
echo "Current Date: $(date)"
echo "Collaborator Status: Online & Synchronized"
`,
};
