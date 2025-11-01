import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { faker } from '@faker-js/faker';
import { of } from 'rxjs';

import { VehicleModule } from '../vehicle.module';
import { VehicleListComponent } from './vehicle-list.component';
import { VehicleService } from '../vehicle.service';
import { Vehicle } from '../vehicle';

describe('VehicleListComponent', () => {
  let component: VehicleListComponent;
  let fixture: ComponentFixture<VehicleListComponent>;
  let vehicleService: VehicleService;
  let mockVehicles: Vehicle[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, VehicleModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleListComponent);
    component = fixture.componentInstance;
    vehicleService = TestBed.inject(VehicleService);

    mockVehicles = Array.from(
      { length: 3 },
      (_, index) =>
        new Vehicle({
          id: index + 1,
          marca: faker.vehicle.manufacturer(),
          linea: faker.vehicle.model(),
          modelo: faker.date.past().getFullYear(),
          kilometraje: faker.number.int({ min: 0, max: 200000 }),
          color: faker.vehicle.color(),
          imagen: faker.image.url(),
        })
    );

    spyOn(vehicleService, 'getVehicles').and.returnValue(of(mockVehicles));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create table with 3 vehicles plus header', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.vehicles.length).toBe(3);

    const compiled = fixture.nativeElement;
    const tableRows = compiled.querySelectorAll('tr');

    // 1 fila de header + 3 filas de datos = 4 filas total
    expect(tableRows.length).toBe(4);

    // Verificar header
    const headerCells = tableRows[0].querySelectorAll('th');
    expect(headerCells.length).toBe(4);
    expect(headerCells[0].textContent.trim()).toBe('#');
    expect(headerCells[1].textContent.trim()).toBe('Marca');
    expect(headerCells[2].textContent.trim()).toBe('Linea');
    expect(headerCells[3].textContent.trim()).toBe('Modelo');

    // Verificar filas de datos
    for (let i = 1; i <= 3; i++) {
      const dataCells = tableRows[i].querySelectorAll('td');
      expect(dataCells.length).toBe(4);
      expect(dataCells[0].textContent.trim()).toBe(
        mockVehicles[i - 1].id.toString()
      );
      expect(dataCells[1].textContent.trim()).toBe(mockVehicles[i - 1].marca);
      expect(dataCells[2].textContent.trim()).toBe(mockVehicles[i - 1].linea);
      expect(dataCells[3].textContent.trim()).toBe(
        mockVehicles[i - 1].modelo.toString()
      );
    }
  });
});
