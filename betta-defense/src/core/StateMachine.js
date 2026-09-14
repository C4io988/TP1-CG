class StateMachine {
  constructor() { /* estado atual */ }
  change(newState) { /* chama exit() do atual, enter() do novo */ }
  update(dt) { /* delega pro estado atual */ }
  render(renderer) { /* delega pro estado atual */ }
}