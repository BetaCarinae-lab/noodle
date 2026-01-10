#!/bin/bash
_noodle_completions()
{
    COMPREPLY=( $(compgen -W "--help --version --new --info" -- "${COMP_WORDS[1]}") )
}
complete -F _noodle_completions noodle
