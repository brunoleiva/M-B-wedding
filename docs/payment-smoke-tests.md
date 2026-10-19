# Testes manuais de pagamentos Pix (ambiente controlado)

Use um presente de teste de baixo valor. Antes de transferir, confira a chave, nome, cidade e valor no aplicativo do banco. Não use dados reais dos convidados nos testes.

1. Em `/presentes`, abra um presente ativo e gere uma cobrança com nome e mensagem. Resultado: abre `/presentes/pedido/<token>`, com QR Code e copia e cola. Nenhum valor deve aparecer como confirmado.
2. No painel de pagamentos, confira nome, mensagem, presente, valor e status pendente. Compare com o pedido gerado.
3. Sem transferir dinheiro, teste a ação de confirmar até abrir o modal e **cancele**. O status deve continuar pendente.
4. Após transferência controlada e conferência **no extrato**, confirme pelo ícone verde. Resultado: status confirmado e total recebido atualizado apenas uma vez.
5. Crie outro pedido sem pagar; arquive-o usando o ícone vermelho. Deve desaparecer da lista ativa, preservar histórico e deixar de ocupar reserva de item limitado.
6. Para presente limitado com quantidade 1, crie pedido pendente e teste uma segunda tentativa; antes do prazo, a reserva deve bloquear o segundo pedido. Após expirar, a reserva deixa de bloquear; o QR estático anterior **pode continuar aceitando pagamentos bancários**.
7. Abra um link de pedido inexistente: deve mostrar 404, sem revelar chave Pix.
8. Execute `pix_payment_diagnostics.sql`; todas as verificações devem retornar `ok = true`, e `pagamentos_sem_presente = 0` (a menos que existam registros legados justificáveis).

Observações: isto é teste manual, não conciliação bancária automática. Não compartilhe tokens/QR Codes reais em logs ou capturas públicas.
