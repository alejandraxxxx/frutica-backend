export function estaDentroDeRadio(
    userLat: number,
    userLng: number,
    tiendaLat: number,
    tiendaLng: number,
    maxKm: number,
  ): boolean {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(tiendaLat - userLat);
    const dLng = toRad(tiendaLng - userLng);
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(userLat)) *
        Math.cos(toRad(tiendaLat)) *
        Math.sin(dLng / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    return distancia <= maxKm;
  }