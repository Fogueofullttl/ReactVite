import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { mockMatches } from '@/data/mockMatches';

/**
 * Convierte Dates a Timestamps para Firestore
 */
function prepareMatchForFirestore(match: any) {
  const data = { ...match };
  
  // Convertir scheduledTime
  if (data.scheduledTime instanceof Date) {
    data.scheduledTime = Timestamp.fromDate(data.scheduledTime);
  }
  
  // Convertir result dates si existen
  if (data.result) {
    if (data.result.enteredAt instanceof Date) {
      data.result.enteredAt = Timestamp.fromDate(data.result.enteredAt);
    }
    
    // Convertir validatedBy timestamps
    if (data.result.validatedBy) {
      const validatedBy: any = {};
      for (const [key, val] of Object.entries(data.result.validatedBy)) {
        const entry = val as any;
        validatedBy[key] = {
          ...entry,
          timestamp: entry.timestamp instanceof Date 
            ? Timestamp.fromDate(entry.timestamp) 
            : entry.timestamp
        };
      }
      data.result.validatedBy = validatedBy;
    }
  }
  
  // Convertir verifiedAt
  if (data.verifiedAt instanceof Date) {
    data.verifiedAt = Timestamp.fromDate(data.verifiedAt);
  }
  
  // Convertir rejectedAt
  if (data.rejectedAt instanceof Date) {
    data.rejectedAt = Timestamp.fromDate(data.rejectedAt);
  }
  
  // Agregar timestamps de creación
  data.createdAt = Timestamp.now();
  data.updatedAt = Timestamp.now();
  
  return data;
}

/**
 * Carga los partidos mock en Firestore
 * Se puede ejecutar desde la consola del navegador
 */
export async function seedMatches() {
  console.log('🌱 Iniciando seed de partidos en Firestore...');
  
  try {
    let successCount = 0;
    let errorCount = 0;
    
    for (const match of mockMatches) {
      try {
        const { id, ...matchData } = match;
        const preparedData = prepareMatchForFirestore(matchData);
        
        await setDoc(doc(db, 'matches', id), preparedData);
        console.log(`✅ Partido ${id} creado exitosamente`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error creando partido ${match.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Seed completado`);
    console.log(`   Éxitos: ${successCount}`);
    console.log(`   Errores: ${errorCount}`);
    console.log(`   Total: ${mockMatches.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return { success: successCount, errors: errorCount, total: mockMatches.length };
  } catch (error) {
    console.error('❌ Error general en seed:', error);
    throw error;
  }
}

/**
 * Exporta seedMatches al window para acceso desde consola
 */
if (typeof window !== 'undefined') {
  (window as any).seedMatches = seedMatches;
}
