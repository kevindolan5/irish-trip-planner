// Town name -> [lat, lng]. Lets a stop just say "Galway" and still land on the map.
// A stop with its own lat/lng overrides this.
export const AREAS = {
  dublin: [53.3498, -6.2603],
  "dublin airport": [53.4264, -6.2499],
  galway: [53.2707, -9.0568],
  cork: [51.8985, -8.4756],
  limerick: [52.6638, -8.6267],
  kilkenny: [52.6541, -7.2448],
  killarney: [52.0599, -9.5044],
  dingle: [52.1409, -10.264],
  doolin: [53.0148, -9.3774],
  "cliffs of moher": [52.9715, -9.4309],
  westport: [53.8008, -9.521],
  sligo: [54.2766, -8.4761],
  donegal: [54.6549, -8.1041],
  belfast: [54.5973, -5.9301],
  "giant's causeway": [55.2408, -6.5116],
  kinsale: [51.7059, -8.5222],
  cobh: [51.8503, -8.2943],
  waterford: [52.2593, -7.1101],
  wexford: [52.3369, -6.4633],
  wicklow: [52.9808, -6.0446],
  glendalough: [53.0101, -6.3274],
  howth: [53.3873, -6.0654],
  kenmare: [51.88, -9.5836],
  connemara: [53.4508, -9.7051],
  "aran islands": [53.1255, -9.6685],
  "rock of cashel": [52.52, -7.8904],
  athlone: [53.4239, -7.9407],
  tralee: [52.2713, -9.7016],
  newgrange: [53.6947, -6.4755],
  lahinch: [52.9334, -9.3441],
  adare: [52.564, -8.7905],
  birr: [53.0977, -7.9132],
  clonmel: [52.3559, -7.7039],
  cloughjordan: [52.9469, -8.0322],
  ennis: [52.8436, -8.9864],
  shannon: [52.7019, -8.8653],
  ennistymon: [52.9419, -9.3056],
  kerry: [52.1545, -9.5669],
  "ring of kerry": [51.9986, -9.7],
};

export function resolveLatLng(stop) {
  if (stop.lat != null && stop.lng != null && stop.lat !== "" && !isNaN(Number(stop.lat))) {
    return [Number(stop.lat), Number(stop.lng)];
  }
  const key = String(stop.area || "").trim().toLowerCase();
  return AREAS[key] || AREAS[String(stop.name || "").trim().toLowerCase()] || null;
}
