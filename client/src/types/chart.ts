export interface BirthData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

export interface Planet {
  name: string;
  degree: number;
  sign: string;
  house: number;
}

export interface House {
  house: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

export interface ChartData {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
}

export interface ChartResponse {
  id: string;
  userId?: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  chartData: ChartData;
  createdAt: string;
}
