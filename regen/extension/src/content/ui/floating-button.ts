/**
 * 浮动按钮组件
 * 在页面上显示一个可拖拽的浮动按钮，用于快速提取JD
 */

interface FloatingButtonOptions {
  onClick: () => void;
}

export class FloatingButton {
  private button: HTMLButtonElement | null = null;
  private options: FloatingButtonOptions;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;

  constructor(options: FloatingButtonOptions) {
    this.options = options;
    this.createButton();
  }

  private createButton() {
    // 创建按钮
    this.button = document.createElement('button');
    this.button.id = 'jd-extractor-float-btn';
    this.button.innerHTML = this.getIconSvg();
    this.button.title = '提取职位信息';

    // 设置样式
    this.button.style.cssText = `
      position: fixed;
      right: 20px;
      bottom: 100px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00b578 0%, #00a870 100%);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 181, 120, 0.4);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      font-size: 24px;
    `;

    // 添加悬停效果
    this.button.addEventListener('mouseenter', () => {
      if (!this.isDragging) {
        this.button!.style.transform = 'scale(1.1)';
        this.button!.style.boxShadow = '0 6px 16px rgba(0, 181, 120, 0.5)';
      }
    });

    this.button.addEventListener('mouseleave', () => {
      if (!this.isDragging) {
        this.button!.style.transform = 'scale(1)';
        this.button!.style.boxShadow = '0 4px 12px rgba(0, 181, 120, 0.4)';
      }
    });

    // 点击事件
    this.button.addEventListener('click', () => {
      if (!this.isDragging) {
        this.options.onClick();
      }
    });

    // 拖拽功能
    this.setupDragging();

    // 添加到页面
    document.body.appendChild(this.button);
  }

  private setupDragging() {
    if (!this.button) return;

    this.button.addEventListener('mousedown', (e) => {
      this.isDragging = false;
      this.startX = e.clientX;
      this.startY = e.clientY;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;

        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          this.isDragging = true;
        }

        if (this.isDragging && this.button) {
          const rect = this.button.getBoundingClientRect();
          this.currentX = rect.left + deltaX;
          this.currentY = rect.top + deltaY;

          // 限制在视口内
          const maxX = window.innerWidth - rect.width;
          const maxY = window.innerHeight - rect.height;

          this.currentX = Math.max(0, Math.min(this.currentX, maxX));
          this.currentY = Math.max(0, Math.min(this.currentY, maxY));

          this.button.style.left = `${this.currentX}px`;
          this.button.style.right = 'auto';
          this.button.style.top = `${this.currentY}px`;
          this.button.style.bottom = 'auto';

          this.startX = e.clientX;
          this.startY = e.clientY;
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // 延迟重置拖拽状态，防止触发点击
        setTimeout(() => {
          this.isDragging = false;
        }, 50);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  }

  private getIconSvg(): string {
    return `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    `;
  }

  setLoading(loading: boolean) {
    if (!this.button) return;

    if (loading) {
      this.button.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"></circle>
        </svg>
      `;
      this.button.style.cursor = 'wait';
    } else {
      this.button.innerHTML = this.getIconSvg();
      this.button.style.cursor = 'pointer';
    }
  }

  destroy() {
    if (this.button && this.button.parentNode) {
      this.button.parentNode.removeChild(this.button);
      this.button = null;
    }
  }
}
