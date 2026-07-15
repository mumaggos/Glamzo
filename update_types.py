with open("src/types/index.ts", "a") as f:
    f.write("""
export interface SalesAgent {
  id: string;
  name: string;
  phone?: string;
  team_name?: string;
  ref_code: string;
  clicks_count: number;
  created_at: string;
}
""")
print("Added SalesAgent to types")
