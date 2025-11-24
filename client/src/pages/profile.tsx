import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, User, Trophy, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Luis Torres",
    email: "luis.torres@example.com",
    birthYear: "1995",
    club: "San Juan TT",
  });

  const profile = {
    id: "5",
    name: "Luis Torres",
    email: "luis.torres@example.com",
    birthYear: 1995,
    club: "San Juan TT",
    memberNumber: "PRTTM-000005",
    role: "player",
    membershipStatus: "active",
    membershipExpiresAt: "2025-12-31",
    photoUrl: null,
    currentRating: 1745,
    currentRank: 5,
    matchesPlayed: 32,
    wins: 25,
    losses: 7,
    winRate: 78.1,
  };

  const ratingHistory = [
    { date: "Nov 1", rating: 1680 },
    { date: "Nov 8", rating: 1695 },
    { date: "Nov 15", rating: 1705 },
    { date: "Nov 22", rating: 1720 },
    { date: "Nov 29", rating: 1710 },
    { date: "Dec 6", rating: 1730 },
    { date: "Dec 13", rating: 1745 },
  ];

  const tournaments = [
    { name: "Island Champions Cup", date: "Dec 2024", placement: "Quarterfinalist", ratingChange: +25 },
    { name: "Holiday Mixed Doubles", date: "Dec 2024", placement: "Runner-up", ratingChange: +15 },
    { name: "Fall Classic", date: "Nov 2024", placement: "Champion", ratingChange: +30 },
  ];

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update profile:", formData);
    setIsEditing(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Player Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your statistics</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={profile.photoUrl || undefined} />
                <AvatarFallback className="text-3xl">{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
              <p className="text-muted-foreground font-mono text-sm mb-4">{profile.memberNumber}</p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge variant="default">Active Member</Badge>
                <Badge variant="outline" className="capitalize">{profile.role}</Badge>
              </div>
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Club</span>
                  <span className="font-medium">{profile.club}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Birth Year</span>
                  <span className="font-medium">{profile.birthYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membership Expires</span>
                  <span className="font-medium">
                    {new Date(profile.membershipExpiresAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Current Rating</p>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-4xl font-bold font-mono mb-1">{profile.currentRating}</p>
              <p className="text-sm text-green-600 dark:text-green-500">+15 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Current Rank</p>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-4xl font-bold mb-1">#{profile.currentRank}</p>
              <p className="text-sm text-green-600 dark:text-green-500">↑1 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Match Record</p>
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-4xl font-bold font-mono mb-1">{profile.wins}-{profile.losses}</p>
              <p className="text-sm text-muted-foreground">{profile.matchesPlayed} matches played</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-4xl font-bold font-mono mb-1">{profile.winRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Above average</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats" data-testid="tab-stats">Statistics</TabsTrigger>
          <TabsTrigger value="tournaments" data-testid="tab-tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Rating History</CardTitle>
              <CardDescription>Your rating progression over the last 3 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ratingHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[1650, 1800]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments">
          <Card>
            <CardHeader>
              <CardTitle>Tournament History</CardTitle>
              <CardDescription>Your recent tournament performances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tournaments.map((tournament, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover-elevate" data-testid={`card-tournament-${index}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{tournament.name}</p>
                      <p className="text-sm text-muted-foreground">{tournament.date}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <Badge variant="outline">{tournament.placement}</Badge>
                      <span className={`font-mono font-semibold ${tournament.ratingChange > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                        +{tournament.ratingChange}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photo">Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.photoUrl || undefined} />
                      <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button type="button" variant="outline" data-testid="button-upload-photo">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Photo
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      data-testid="input-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="birthYear">Birth Year</Label>
                    {isEditing ? (
                      <Select
                        value={formData.birthYear}
                        onValueChange={(value) => setFormData({ ...formData, birthYear: value })}
                      >
                        <SelectTrigger id="birthYear" data-testid="select-birth-year">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input id="birthYear" value={formData.birthYear} disabled />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="club">Club</Label>
                    <Input
                      id="club"
                      value={formData.club}
                      onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                      disabled={!isEditing}
                      data-testid="input-club"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button type="submit" data-testid="button-save">
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel">
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
