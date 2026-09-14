class SpawnManager {
  constructor(enemyTypes) { /* timer acumulado, referência às configs de inimigo */ }
  update(dt, elapsedGameTime, enemyList) {
    /* decide se é hora de spawnar, escolhe um tipo (aleatório ponderado
       pelo tempo decorrido) e uma borda da tela, instancia o Enemy */
  }
  getSpawnInterval(elapsedGameTime) {
    /* função que diminui o intervalo (ou aumenta a quantidade)
       conforme o tempo passa — é aqui que mora a dificuldade crescente */
  }
}