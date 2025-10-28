import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const TestLoginInfo = () => {
  return (
    <Card className="w-full max-w-md mt-4 border-accent/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-accent" />
          <CardTitle className="text-lg">Contas de Teste</CardTitle>
        </div>
        <CardDescription>
          Use estas credenciais para testar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="p-3 bg-accent/10 rounded-lg">
          <p className="font-semibold">Email: joao@demo.com</p>
          <p className="text-muted-foreground">Senha: demo123</p>
        </div>
        <div className="p-3 bg-accent/10 rounded-lg">
          <p className="font-semibold">Email: maria@demo.com</p>
          <p className="text-muted-foreground">Senha: demo123</p>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          Todos os usuários demo usam a senha: demo123
        </p>
      </CardContent>
    </Card>
  );
};

export default TestLoginInfo;
