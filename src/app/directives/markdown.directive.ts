import {Directive, Input, ElementRef, OnDestroy, EventEmitter, Output} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as EasyMDE from 'easymde';
import { MarkdownService } from '../services/markdown.service';
@Directive({
  selector: '[cosmarkdown]'
})
export class MarkdownDirective implements OnDestroy {
  @Input() item: string = ''; // The text for the tooltip to display
  @Output() itemChange = new EventEmitter<string>();
  @Input() limit: number = 100; // Optional delay input, in m
  @Input() cosMarkdownTranslateCharacterStatusKey: any;
  CHAR_COUNTER_ELEMENT_CLASS_NAME = 'charCounter';
  curLength = 0;
  easymde;

  config: any = {
    placeholder: this.el.nativeElement.attributes.getNamedItem('placeholder')?.value,
    toolbar: [
      {
        name: 'bold',
        action: EasyMDE.toggleBold,
        className: 'fa fa-bold',
        title: this.Translate.instant('MDEDITOR_TOOLTIP_BOLD'),
      },
      {
        name: 'italic',
        action: EasyMDE.toggleItalic,
        className: 'fa fa-italic',
        title: this.Translate.instant('MDEDITOR_TOOLTIP_ITALIC'),
      },
      {
        name: 'strikethrough',
        action: EasyMDE.toggleStrikethrough,
        className: 'fa fa-strikethrough',
        title: this.Translate.instant('MDEDITOR_TOOLTIP_STRIKETHROUGH'),
      },
      '|',
      {
        name: 'ordered-list	',
        action: EasyMDE.toggleOrderedList,
        className: 'fa fa-list-ol',
        title: this.Translate.instant('MDEDITOR_TOOLTIP_ORDERED_LIST'),
      },
      {
        name: 'unordered-list	',
        action: EasyMDE.toggleUnorderedList,
        className: 'fa fa-list-ul',
        title: this.Translate.instant('MDEDITOR_TOOLTIP_UNORDERED_LIST'),
      },
      {
        name: 'preview	',
        action: EasyMDE.togglePreview,
        className: 'fa fa-eye no-disable',
        title: this.Translate.instant('MDEDITOR_TOOLTIP_PREVIEW'),
      }
    ],
    preview: true,
    blockStyles: {
      italic: '_'
    },
    status: [{
      className: this.CHAR_COUNTER_ELEMENT_CLASS_NAME,
      defaultValue: this.updateCharacterCount,
      onUpdate: this.updateCharacterCount
    }],
    element: this.el.nativeElement,
    initialValue: this.item
  };
  constructor(private el: ElementRef, private Translate: TranslateService, markdown: MarkdownService) {
    this.easymde = new EasyMDE(this.config);
    this.easymde.codemirror.on('beforeChange', this.enforceMaxLength);
    this.easymde.codemirror.on('change',() => {
      //let curLength = this.easymde.value().length;
        this.itemChange.emit(this.easymde.value());
    });
  }

  ngOnInit(): void {
    this.easymde.value(this.item);
  }
  ngOnDestroy(): void {
  }

  getCharLength() {
    let curLength = 0;
    if (this.item && this.item.length) {
      curLength = this.item.length;
    }

    return curLength;
  };


  updateCharacterCount() {
    if (this.cosMarkdownTranslateCharacterStatusKey && this.limit) {
      this.el.nativeElement.innerHTML = this.Translate.instant(this.cosMarkdownTranslateCharacterStatusKey, {
        numberOfCharacters: this.limit,
      }) + ' (' + (this.limit - this.getCharLength()) + ')';
    }
  };


  enforceMaxLength(cm: any, change: any) {
    const maxLength = cm.getOption('maxLength');
    if (maxLength && change.update) {
      let str = change.text.join('\n');
      let delta = str.length - (cm.indexFromPos(change.to) - cm.indexFromPos(change.from));
      if (delta <= 0) {
        return true;
      }
      delta = cm.getValue().length + delta - maxLength;
      if (delta > 0) {
        str = str.substr(0, str.length - delta);
        change.update(change.from, change.to, str.split('\n'));
      }
    }
    return true;
  };
  /*
  scope.$watch('limit', function(newVal, oldVal) {
      if (newVal) {
        easymde.codemirror.setOption('maxLength', newVal);
        if (easymde.gui.statusbar) {
          var statusBarElement = easymde.gui.statusbar.getElementsByClassName(CHAR_COUNTER_ELEMENT_CLASS_NAME)[0];
          if (statusBarElement) {
            updateCharacterCount(statusBarElement);
          }
        }
      }
    });*/
  /*

  */
}