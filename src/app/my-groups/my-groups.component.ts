import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'my-groups',
  templateUrl: './my-groups.component.html',
  styleUrls: ['./my-groups.component.scss']
})
export class MyGroupsComponent implements OnInit {
  wWidth = window.innerWidth;
  constructor() { }

  ngOnInit(): void {
  }

}
