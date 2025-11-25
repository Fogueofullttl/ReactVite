import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, DollarSign, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TournamentRegistrationFormProps {
  tournament: {
    id: string;
    name: string;
    type: "singles" | "doubles";
    entryFee: number;
    maxParticipants: number;
    currentParticipants: number;
  };
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export function TournamentRegistrationForm({
  tournament,
  onSubmit,
  onCancel,
}: TournamentRegistrationFormProps) {
  const { toast } = useToast();
  const [partnerId, setPartnerId] = useState("");
  const [paymentCode, setPaymentCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentCode.length !== 5) {
      toast({
        title: "Invalid payment code",
        description: "ATH Móvil code must be exactly 5 characters",
        variant: "destructive",
      });
      return;
    }

    const data = {
      tournamentId: tournament.id,
      partnerId: tournament.type === "doubles" ? partnerId : undefined,
      paymentCode: paymentCode.toUpperCase(),
    };

    onSubmit?.(data);

    toast({
      title: "Registration submitted",
      description: "Your registration is pending payment verification",
    });
  };

  const spotsRemaining = tournament.maxParticipants - tournament.currentParticipants;
  const isFull = spotsRemaining <= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5" />
              Tournament Registration
            </CardTitle>
            <CardDescription>{tournament.name}</CardDescription>
          </div>
          <Badge variant="outline" className="capitalize flex-shrink-0">
            {tournament.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isFull ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tournament Full</h3>
            <p className="text-muted-foreground">
              This tournament has reached maximum capacity ({tournament.maxParticipants} participants)
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Entry Fee</span>
                </div>
                <span className="text-lg font-bold">${tournament.entryFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Available Spots</span>
                </div>
                <span className="text-lg font-bold">
                  {spotsRemaining} remaining
                </span>
              </div>
            </div>

            {tournament.type === "doubles" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="partner">Doubles Partner</Label>
                  <Select value={partnerId} onValueChange={setPartnerId}>
                    <SelectTrigger id="partner" data-testid="select-partner">
                      <SelectValue placeholder="Select a partner or request automatic pairing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatic Pairing</SelectItem>
                      <SelectItem value="player1">Carlos Rivera</SelectItem>
                      <SelectItem value="player2">María González</SelectItem>
                      <SelectItem value="player3">José Martínez</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose a specific partner or let us pair you automatically
                  </p>
                </div>
                <Separator />
              </>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold">Payment Information</h3>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-sm mb-2">
                  <span className="font-semibold">Payment Instructions:</span>
                </p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Send ${tournament.entryFee} via ATH Móvil to: 787-555-PRTT</li>
                  <li>Use "{tournament.name}" as the payment description</li>
                  <li>Copy the 5-character confirmation code from ATH Móvil</li>
                  <li>Enter the code below to complete registration</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentCode">ATH Móvil Confirmation Code *</Label>
                <Input
                  id="paymentCode"
                  type="text"
                  maxLength={5}
                  placeholder="ABC12"
                  value={paymentCode}
                  onChange={(e) => setPaymentCode(e.target.value.toUpperCase())}
                  className="font-mono text-lg tracking-wider uppercase"
                  required
                  data-testid="input-payment-code"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 5-character code from your ATH Móvil confirmation
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 text-sm">
              <p className="font-semibold mb-2">Registration Requirements:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>Active membership required</li>
                <li>Payment must be verified before tournament starts</li>
                <li>Refunds available up to 48 hours before event</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={paymentCode.length !== 5}
                data-testid="button-submit-registration"
              >
                Submit Registration
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
