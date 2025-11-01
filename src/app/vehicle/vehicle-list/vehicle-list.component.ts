import { Component, OnInit } from '@angular/core';

import { VehicleService } from '../vehicle.service';
import { Vehicle } from '../vehicle';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css',
})
export class VehicleListComponent implements OnInit {
  vehicles: Array<Vehicle> = [];
  brandCounts: { [key: string]: number } = {};

  constructor(private vehicleService: VehicleService) {}

  ngOnInit() {
    this.getVehicles();
  }

  getVehicles(): void {
    this.vehicleService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
      this.calculateBrandCounts();
    });
  }

  calculateBrandCounts(): void {
    this.brandCounts = this.vehicles.reduce((acc, vehicle) => {
      acc[vehicle.marca] = (acc[vehicle.marca] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    console.log('***', this.brandCounts)
  }
}
