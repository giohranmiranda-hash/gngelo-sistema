/* =====================================================================
   REGRAS DE PONTUAÇÃO
   ---------------------------------------------------------------------
   Mesma lógica é replicada no banco (supabase/schema.sql) para que o
   cálculo oficial aconteça no servidor. Aqui usamos para o modo demo e
   para mostrar prévias na interface.

   Regras:
     • Placar exato ................ 10 pontos
     • Acertou vencedor / empate .... 5 pontos
     • Acertou os gols do Brasil .... 2 pontos
     • Acertou os gols do adversário  2 pontos
     • Errou tudo ................... 0 pontos

   Observação: "Placar exato" (10) substitui as parciais — não soma.
   Quando não é exato, somam-se as parciais (vencedor + gols Brasil +
   gols adversário). Máximo possível sem ser exato = 9 pontos.
   ===================================================================== */

window.Scoring = {
  /** Retorna o resultado: 'brasil' | 'adversario' | 'empate' */
  outcome(brazil, opp) {
    if (brazil > opp) return "brasil";
    if (brazil < opp) return "adversario";
    return "empate";
  },

  /**
   * Calcula os pontos de um palpite comparado ao placar oficial.
   * @param {{brazil:number, opp:number}} guess  Palpite do usuário
   * @param {{brazil:number, opp:number}} real   Placar oficial
   * @returns {{points:number, exact:boolean, detail:string}}
   */
  calculate(guess, real) {
    if (
      guess == null || real == null ||
      guess.brazil == null || guess.opp == null ||
      real.brazil == null || real.opp == null
    ) {
      return { points: 0, exact: false, detail: "Sem palpite ou placar." };
    }

    // 1) Placar exato → 10 pontos
    if (guess.brazil === real.brazil && guess.opp === real.opp) {
      return { points: 10, exact: true, detail: "Placar exato! +10 pts" };
    }

    // 2) Parciais
    let points = 0;
    const parts = [];

    if (this.outcome(guess.brazil, guess.opp) === this.outcome(real.brazil, real.opp)) {
      points += 5;
      parts.push("vencedor (+5)");
    }
    if (guess.brazil === real.brazil) {
      points += 2;
      parts.push("gols Brasil (+2)");
    }
    if (guess.opp === real.opp) {
      points += 2;
      parts.push("gols adversário (+2)");
    }

    const detail = points === 0 ? "Não pontuou desta vez." : `Acertou ${parts.join(", ")} = ${points} pts`;
    return { points, exact: false, detail };
  },
};
