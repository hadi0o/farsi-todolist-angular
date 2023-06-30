import { Component, OnDestroy, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { IToDoItem } from './interfaces/to-do-item';
import {timer, takeUntil, Subject, map} from "rxjs"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy{
  id: string = localStorage.getItem("tab") || "active";
  pending: IToDoItem[] = JSON.parse(localStorage.getItem("pending")!) || [];
  completed: IToDoItem[] = JSON.parse(localStorage.getItem("completed")!) || [];
  input = "";
  destr = new Subject<void>();
  constructor(private rend: Renderer2){}
  ngOnDestroy(): void {
    this.destr.next();
  }
  tabChange(t:string){
    this.id = t;
    localStorage.setItem("tab", this.id)
  }
  addToDo(form: NgForm){
    let item: IToDoItem = {
      item: this.input,
      checked: false,
      dateCreated: new Date(Date.now()).toUTCString()
    };
    this.pending.push(item);
    localStorage.setItem("pending", JSON.stringify(this.pending));
    form.reset(this.input);
  }
  handleCheckBox(e:any, i:number){
    if(e.target.checked === undefined) return;
    const parent = e.target.parentNode.parentElement;
    this.pending[i].checked = !this.pending[i].checked;
    this.completed.push(this.pending[i]);
    if(e.target.checked === this.pending[i].checked){
      this.removeItem(parent,i);
    }
  }
  editToDo(i:number){
    const newVal = prompt('مقدار جدید را وارد کنید');
    if(newVal?.trim() === "") alert("It's Required");
    else{
      this.pending[i].item = newVal!;
      this.pending[i].dateCreated = new Date(Date.now()).toUTCString();
    }
    localStorage.setItem("pending", JSON.stringify(this.pending))
  }
  deleteToDo(i:number){
    const sure = confirm("مطمئن هستید این برنامه را حذف کنید?");
    if(sure){
      this.completed.splice(i,1);
      localStorage.setItem("completed", JSON.stringify(this.completed));
    }
  }
  markAll(){
    if(!this.pending.length) {
      alert("هیچ برنامه در حال انجام وجود ندارد");
      return;
    }
    this.pending.map((_,i)=>{
      this.pending[i].checked = true;this.completed.push(this.pending[i]);
      if(this.pending[i].checked) {
        this.removeItem(document.querySelectorAll(".toDo")[i], i, this.pending.length);
      }
    })
  }
  removeItem(parent: any, i:number, count: number = 1){
    this.rend.addClass(parent, "hide");
    timer(500).pipe(map(()=>{
      parent.remove();
      this.pending.splice(i,count);
      localStorage.setItem("pending", JSON.stringify(this.pending))
    }),takeUntil(this.destr)).subscribe();
    localStorage.setItem("completed", JSON.stringify(this.completed))
  }
  clearAll(){
    if(!this.completed.length) {
      alert("هیچ برنامه ی کامل شده ای وجود ندارد!");
      return;
    }
    const sure = confirm("آیا مطمئن هستید میخواهید تمام برنامه های کامل شده را حذف کنید؟");
    this.completed.map(()=>{
      if(sure){
        this.completed.splice(0,this.completed.length);
        localStorage.setItem("completed", JSON.stringify(this.completed))
      }
    })
  }
}
