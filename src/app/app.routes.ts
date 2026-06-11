import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

const loadDetailComponent = () =>
  import('./features/detail/detail.component').then((m) => m.DetailComponent);

const loadLoginComponent = () =>
  import('./features/login/login.component').then((m) => m.LoginComponent);

const loadRegisterComponent = () =>
  import('./features/register/register.component').then((m) => m.RegisterComponent);

const loadCartComponent = () =>
  import('./features/cart/cart.component').then((m) => m.CartComponent);

const loadCheckoutComponent = () =>
  import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent);

const loadVnpayReturnComponent = () =>
  import('./features/vnpay-return/vnpay-return.component').then((m) => m.VnpayReturnComponent);

const loadMomoReturnComponent = () =>
  import('./features/momo-return/momo-return.component').then((m) => m.MomoReturnComponent);

const loadPaymentResultComponent = () =>
  import('./features/payment-result/payment-result.component').then(
    (m) => m.PaymentResultComponent
  );

const loadAccountComponent = () =>
  import('./features/account/account.component').then((m) => m.AccountComponent);

const loadOrderHistoryComponent = () =>
  import('./features/order-history/order-history.component').then((m) => m.OrderHistoryComponent);

const loadAdminComponent = () =>
  import('./features/admin/admin.component').then((m) => m.AdminComponent);

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  {
    path: 'product/:id',
    loadComponent: loadDetailComponent,
  },
  // {path: 'create', component: CreateComponent}
  {
    path: 'login',
    loadComponent: loadLoginComponent,
  },
  {
    path: 'register',
    loadComponent: loadRegisterComponent,
  },
  {
    path: 'account',
    loadComponent: loadAccountComponent,
  },
  {
    path: 'order-history',
    loadComponent: loadOrderHistoryComponent,
  },
  {
    path: 'admin',
    redirectTo: 'admin/users',
    pathMatch: 'full',
  },
  {
    path: 'admin/users',
    loadComponent: loadAdminComponent,
    data: { tab: 'users' },
  },
  {
    path: 'admin/roles',
    loadComponent: loadAdminComponent,
    data: { tab: 'roles' },
  },
  {
    path: 'admin/products',
    loadComponent: loadAdminComponent,
    data: { tab: 'products' },
  },
  {
    path: 'admin/orders',
    loadComponent: loadAdminComponent,
    data: { tab: 'orders' },
  },
  {
    path: 'cart',
    loadComponent: loadCartComponent,
  },
  {
    path: 'checkout',
    loadComponent: loadCheckoutComponent,
  },
  {
    path: 'vnpay-return',
    loadComponent: loadVnpayReturnComponent,
  },
  {
    path: 'momo-return',
    loadComponent: loadMomoReturnComponent,
  },
  {
    path: 'payment-result',
    loadComponent: loadPaymentResultComponent,
  },
];
