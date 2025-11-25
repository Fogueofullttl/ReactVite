import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Users } from 'lucide-react';
import { getAllUsers, UserProfile } from '@/lib/users';

export default function Ratings() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      const sortedData = data.sort((a, b) => {
        const ratingA = a.profile?.rating || a.rating || 1000;
        const ratingB = b.profile?.rating || b.rating || 1000;
        return ratingB - ratingA;
      });
      setUsers(sortedData);
      setFilteredUsers(sortedData);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      const profile = user.profile || user;
      const firstName = (profile.firstName || '').toLowerCase();
      const lastName = (profile.lastName || '').toLowerCase();
      const memberNumber = (user.memberNumber || '').toLowerCase();
      const club = (profile.club || '').toLowerCase();
      
      return (
        firstName.includes(term) ||
        lastName.includes(term) ||
        memberNumber.includes(term) ||
        club.includes(term)
      );
    });

    setFilteredUsers(filtered);
  };

  const getPlayerName = (user: UserProfile): string => {
    const profile = user.profile || user;
    const firstName = profile.firstName || '';
    const lastName = profile.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Sin nombre';
  };

  const getInitials = (user: UserProfile): string => {
    const profile = user.profile || user;
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'NN';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Cargando ratings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Sistema de Ratings FPTM
        </h1>
        <p className="text-muted-foreground mb-4">
          Todos los jugadores registrados - {users.length} jugadores
        </p>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, apellido, numero de miembro o club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            {searchTerm && (
              <div className="mt-2 text-sm text-muted-foreground">
                Mostrando {filteredUsers.length} de {users.length} jugadores
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Tabla de Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No se encontraron jugadores</p>
              <p className="text-sm text-muted-foreground mt-1">
                Intenta con otros terminos de busqueda
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Pos</TableHead>
                    <TableHead>Jugador</TableHead>
                    <TableHead className="hidden md:table-cell">No. Miembro</TableHead>
                    <TableHead className="hidden lg:table-cell">Club</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Torneos</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">V-D</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => {
                    const profile = user.profile || user;
                    const globalPosition = users.indexOf(user) + 1;
                    
                    return (
                      <TableRow key={user.uid} data-testid={`row-player-${index}`}>
                        <TableCell className="font-semibold font-mono">
                          {globalPosition}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={profile.photoURL} />
                              <AvatarFallback>
                                {getInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold" data-testid={`text-player-name-${index}`}>
                                {getPlayerName(user)}
                              </div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                {user.memberNumber}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="font-mono text-sm hidden md:table-cell">
                          {user.memberNumber || '-'}
                        </TableCell>
                        
                        <TableCell className="hidden lg:table-cell">
                          {profile.club || '-'}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                            {profile.rating || 1000}
                          </span>
                        </TableCell>
                        
                        <TableCell className="text-right text-muted-foreground hidden sm:table-cell">
                          {profile.tournamentsPlayed || 0}
                        </TableCell>
                        
                        <TableCell className="text-right hidden sm:table-cell">
                          <span className="text-green-600 font-semibold">
                            {profile.wins || 0}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-red-600 font-semibold">
                            {profile.losses || 0}
                          </span>
                        </TableCell>
                        
                        <TableCell className="text-center hidden md:table-cell">
                          <Badge variant={
                            profile.membershipStatus === 'active' ? 'default' : 'secondary'
                          }>
                            {profile.membershipStatus === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
