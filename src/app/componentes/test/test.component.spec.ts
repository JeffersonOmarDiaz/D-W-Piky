import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { IonicModule } from '@ionic/angular';
// import { Cliente } from 'src/app/modelBD';
// import { FirestoreService } from 'src/app/services/firestore.service';
import { TestComponent } from './test.component';

describe('Validación de variables inicializadas para registro de clientes', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TestComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  // NO Se debe activar el cosntructor
  it('Test - Verificar si las variables del cliente estan definidas', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const app = fixture.componentInstance;
    expect(app.cliente).toBeDefined();
    });

  it('Test - Validar carga de datos del cliente', () =>{
    const fixture = TestBed.createComponent(TestComponent);
    const app = fixture.componentInstance;
    expect(app.cliente).toBeDefined();
    expect(app.inicioClientes().length).toBeGreaterThan(0);
  });

  it('Test - registro de clientes', () =>{
    const fixture = TestBed.createComponent(TestComponent);
    const app = fixture.componentInstance;
    expect(app.dataCliente([app.cliente])).toBeDefined();
    expect(app.dataCliente([app.cliente]).length).toBeGreaterThan(0);
  });

  
  // it('#getValue should return real value from the real service', () => {
  //   servicioPrincipal = new TestComponent(new FirestoreService(new (AngularFirestore)));
  //   expect(servicioPrincipal.enviarID()).toBe('real value');
  // });
});

describe('Autenticación del usuairo ', () => {

  let service: TestComponent;

  beforeEach(() => {
      service = new TestComponent;
  });

  afterEach(() => {
      service = null;
      localStorage.removeItem('token');
  });

  it('Debe retornar true si usuario tiene un token de autenticación', () => {
      localStorage.setItem('token', '1234');
      expect(service.isAuthenticated()).toBeTruthy();
  });

  it('Debe retornar falso si el usuario no tiene un token de autenticación', () => {
      expect(service.isAuthenticated()).toBeFalsy();
  });

});

describe('Componente de autenticación - Login', () => {
  
  let service: TestComponent;
  let spy: any;
  let component: TestComponent;
  beforeEach(() => {
      service = new TestComponent;
      component = new TestComponent;
  });

  afterEach(() => {
      service = null;
      component = null;
      localStorage.removeItem('token');
  });


  it('Retorna un true si el usuario no cuenta con un token', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const app = fixture.componentInstance;
    let interna = app;
    expect(app.needsLogin()).toBeFalsy;
    spy = spyOn(interna, 'isAuthenticated').and.returnValue(false);
    expect(component.needsLogin()).toBeTruthy();
  });

  it('Retorna un false si el usuario y cuenta con un token', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const app = fixture.componentInstance;
    let interna = app;
    localStorage.setItem('token', '1234');
    expect(app.needsLogin()).toBeTruthy;  
    spy = spyOn(interna, 'isAuthenticated').and.returnValue(true);
    expect(component.needsLogin()).toBeFalsy();
    
  });
});


describe('Validación de variables inicializadas para registro de mascotas', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TestComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('Test - Verificar si las variables del cliente estan definidas', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const app = fixture.componentInstance;
    expect(app.cliente).toBeDefined();
  });

  it('Test - Verificar si las variables de las mascotas', () => {
      const fixture = TestBed.createComponent(TestComponent);
      const app = fixture.componentInstance;
      expect(app.mascotas).toBeDefined();
  });
  it('Test - Validar carga de datos de la mascota dentro del cliente', () =>{
    const fixture = TestBed.createComponent(TestComponent);
    const app = fixture.componentInstance;
    expect([app.mascotas].length).toBeGreaterThan(0);
    expect([app.duenio.mascotas].length).toBeGreaterThanOrEqual(1);
  });
});