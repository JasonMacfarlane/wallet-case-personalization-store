import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomizeComponent } from './customize.component';

const routes: Routes = [
  {
    path: '',
    component: CustomizeComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./routes/designer/designer.module').then(mod => mod.DesignerModule),
        data: { isRoot: true, title: 'Personalized Wallet Case' },
      },
      {
        path: 'crop',
        loadChildren: () => import('./routes/crop/crop.module').then(mod => mod.CropModule),
        data: { isRoot: false, title: 'Crop Photo' },
      },
      {
        path: 'text',
        loadChildren: () => import('./routes/text/text.module').then(mod => mod.TextModule),
        data: { isRoot: false, title: 'Text' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomizeRoutingModule { }
