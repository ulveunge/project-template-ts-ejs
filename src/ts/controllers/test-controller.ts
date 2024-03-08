import { Controller } from "@hotwired/stimulus";

export default class TestController extends Controller<HTMLElement> {
  connect() {
    console.log("hello stimulus");
  }
}
