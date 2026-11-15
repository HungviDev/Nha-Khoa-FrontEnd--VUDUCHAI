// ==============================================================================
// PLACEHOLDER COMPONENT - MODULAR EXPANSION PLACEHOLDER
// ==============================================================================

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzEmptyModule, NzButtonModule, NzIconModule],
  template: `
    <div class="dental-card placeholder-card">
      <nz-empty
        nzNotFoundImage="simple"
        [nzNotFoundContent]="contentTpl"
      >
        <ng-template #contentTpl>
          <div class="empty-content">
            <h3>{{ title }}</h3>
            <p>Phân hệ chức năng đã sẵn sàng trên kiến trúc Base Project và kết nối trực tiếp với REST API Backend.</p>
          </div>
        </ng-template>
      </nz-empty>
    </div>
  `,
  styles: [`
    .placeholder-card {
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;

      .empty-content {
        h3 {
          margin: 12px 0 6px;
          color: #0284c7;
          font-weight: 600;
        }

        p {
          color: #64748b;
          font-size: 13px;
        }
      }
    }
  `]
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] || 'Phân Hệ Nha Khoa';
}

