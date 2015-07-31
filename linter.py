#
# linter.py
# Linter for SublimeLinter3, a code checking framework for Sublime Text 3
#
# Written by @kungfusheep
# Copyright (c) 2015 @kungfusheep
#
# License: MIT
#
"""This module exports the Stylelint plugin class."""

import os

from SublimeLinter.lint import Linter, util

class Stylelint(Linter):

    """Provides an interface to stylelint."""

    syntax = ('css', 'css3')
    cmd = ('node', os.path.dirname(os.path.realpath(__file__)) + '/stylelint_wrapper.js', '@')
    error_stream = util.STREAM_BOTH
    config_file = ('--config', '.stylelintrc')
    tempfile_suffix = 'css'
    regex = (
        r'^.+?\[(?P<line>\d+), (?P<col>\d+)\]: '
        r'(?P<message>.+)'
    )
