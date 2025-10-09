import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import template from "./packages.route.component.html";
import style from "./packages.route.component.css";
import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";
import {
  ComponentBase,
  query,
} from "@dooboostore/dom-render/components/ComponentBase";
import { OtherData } from "@dooboostore/dom-render/lifecycle/OnChangeAttrRender";

@Sim
@Component({
  template,
  styles: [style],
})
export class PackagesRouteComponent extends ComponentBase {
  @query(".packages-container")
  container?: HTMLDivElement;

  private observer?: IntersectionObserver;

  constructor() {
    super();
  }
  private updateActiveMenuItem(activeId: string) {
    if (!this.container) return;

    // Remove all active states
    const allItems = this.container.querySelectorAll(".sidebar-item");
    allItems.forEach((item) => item.classList.remove("active"));

    // Add active state to current item
    const activeItem = this.container.querySelector(
      `[href="/packages/${activeId}"]`,
    );
    if (activeItem) {
      activeItem.classList.add("active");

      // Also expand the parent category
      const parentSection = activeItem.closest(".sidebar-section");
      if (parentSection) {
        const items = parentSection.querySelector(".sidebar-items");
        const arrow = parentSection.querySelector(".category-arrow");
        if (items && arrow) {
          items.classList.add("open");
          arrow.classList.add("rotated");
        }
      }
    }
  }

  onChangeAttrRender(name: string, value: any, other: OtherData) {
    super.onChangeAttrRender(name, value, other);
    console.log('PackagesRouteComponent onChangeAttrRender', name, value, other);
  }

  private setupIntersectionObserver() {
    if (!this.container) return;

    // Observe sections with data-section attribute
    const sections = this.container.querySelectorAll("[data-section]");

    if (sections.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-section");
            if (sectionId) {
              this.updateActiveMenuItem(sectionId);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0.1,
      },
    );

    sections.forEach((section) => {
      this.observer!.observe(section);
    });
    // Setup intersection observer for active menu detection
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 100);
  }

  onDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
