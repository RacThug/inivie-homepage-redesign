# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.

## Not triage labels

`cms`, `web`, and `full-stack` are **area** labels, not triage states. They say which application an issue touches, and every issue carries one. They are orthogonal to the table above: an issue is labelled with one area and one triage state.

## Creating the labels

Only `wontfix` ships with a new GitHub repo. The other four were created with the commands below,
recorded here so a fresh clone or a second repo can reproduce the same vocabulary:

```
gh label create needs-triage    --description "Maintainer needs to evaluate this issue"  --color d4c5f9
gh label create needs-info      --description "Waiting on reporter for more information" --color fbca04
gh label create ready-for-agent --description "Fully specified, ready for an AFK agent"  --color 006b75
gh label create ready-for-human --description "Requires human implementation"            --color c5def5
```

Colours are chosen to not collide with the `cms` / `web` / `full-stack` area labels,
so a triage state and an area stay tellable apart at a glance in the issue list.
