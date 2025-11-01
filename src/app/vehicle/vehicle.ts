export interface VehicleProps {
  id: number;
  marca: string;
  linea: string;
  modelo: number;
  kilometraje: number;
  color: string;
  imagen: string;
}

export class Vehicle {
  id: number;
  marca: string;
  linea: string;
  modelo: number;
  kilometraje: number;
  color: string;
  imagen: string;

  constructor(props: VehicleProps) {
    this.id = props.id;
    this.marca = props.marca;
    this.linea = props.linea;
    this.modelo = props.modelo;
    this.kilometraje = props.kilometraje;
    this.color = props.color;
    this.imagen = props.imagen;
  }
}
