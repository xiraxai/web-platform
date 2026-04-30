@AGENTS.md

## Workflow operativo (sesiones con Claude)

### Entrega de cambios

Cuando completes una tanda de cambios y abras un PR, **siempre** devolver al usuario en el mensaje final:

1. **URL del PR** completa y clickeable (formato `https://github.com/xiraxai/web-platform/pull/N`).
2. **URL del preview de Vercel** una vez Vercel reporte Ready (formato `https://web-platform-git-<branch>-<team>.vercel.app`). Si todavía no está Ready, advertir al usuario y darle la URL del dashboard de Vercel para que la chequee.
3. **Acción concreta para mergear**: la misma URL del PR + instrucción explícita ("Click en la flecha ▼ del botón verde → Squash and merge → Confirm"). Nunca asumir que el usuario sabe el botón a clickear.

### Después del merge

Cuando el usuario confirme que mergeó, ofrecer y/o ejecutar:

- `git checkout main && git pull origin main`
- `git branch -d <branch-mergeada>`
- `git fetch --prune origin` (limpiar refs remotos huérfanos)
- Branch nueva para la siguiente tanda con `git checkout -b feat/<nombre>`

### Stacked PRs

Cuando una PR depende de otra no mergeada, abrirla con `base = <branch-anterior>` (no `main`) y avisar explícitamente que está stacked. Cuando la base mergee, GitHub auto-rebase contra main.

### Plantilla del mensaje de cierre

```
PR listo.
- PR: https://github.com/xiraxai/web-platform/pull/N
- Preview Vercel: <URL o "esperando deploy">
- Mergear: ir al PR → flecha ▼ → Squash and merge → Confirm

Próximos pasos: <lista breve>
```
