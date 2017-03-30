#
# linter.py
# Linter for SublimeLinter3, a code checking framework for Sublime Text 3
#
# Written by @kungfusheep
# Copyright (c) 2016 @kungfusheep
#
# License: MIT
#
"""This module exports the Stylelint plugin class."""

import json
import os
import re
import sublime

from SublimeLinter.lint import NodeLinter


class Stylelint(NodeLinter):
    """Provides an interface to stylelint."""

    syntax = ('css', 'css3', 'sass', 'scss', 'postcss', 'less', 'sugarss', 'sss', 'vue')
    npm_name = 'stylelint'
    cmd = ('stylelint', '--formatter', 'json', '--stdin', '--stdin-filename', '@')
    version_args = '--version'
    version_re = r'(?P<version>\d+\.\d+\.\d+)'
    version_requirement = '>= 7.0.0'

    line_col_base = (1, 1)

    crash_regex = re.compile(
        r'^.*?\r?\n?\w*Error: (.*)',
        re.MULTILINE
    )

    selectors = {
        'html': 'source.css.embedded.html',
        'vue': 'source.css.embedded.html'
    }

    def find_errors(self, output):
        """
        Parse errors from linter's output.

        We override this method to handle parsing stylelint crashes.
        """
        data = None
        match = self.crash_regex.match(output)

        if match:
            msg = "Stylelint crashed: %s" % match.group(1)
            yield (match, 0, None, "Error", "", msg, None)

        try:
            if output and not match:
                data = json.loads(output)[0]
        except:
            yield (match, 0, None, "Error", "", "Output json data error", None)

        if data and 'errored' in data:
            for option in data['invalidOptionWarnings']:
                text = option['text']

                yield (True, 0, None, "Error", "", text, None)

            for option in data['deprecations']:
                text = option['text']

                yield (True, 0, None, "", "Warning", text, None)

            for warning in data['warnings']:
                line = warning['line'] - self.line_col_base[0]
                col = warning['column'] - self.line_col_base[1]
                type = warning['severity']
                text = warning['text']

                if type == 'warning':
                    yield (True, line, col, "", type, text, None)
                else:
                    yield (True, line, col, type, "", text, None)

        return super().find_errors(output)

    def communicate(self, cmd, code=None):
        """Run an external executable using stdin to pass code and return its output."""
        if '__RELATIVE_TO_FOLDER__' in cmd:

            relfilename = self.filename
            window = self.view.window()

            # can't get active folder, it will work only if there is one folder in project
            if int(sublime.version()) >= 3080 and len(window.folders()) < 2:

                vars = window.extract_variables()

                if 'folder' in vars:
                    relfilename = os.path.relpath(self.filename, vars['folder'])

            cmd[cmd.index('__RELATIVE_TO_FOLDER__')] = relfilename

        elif not code:

            filename = self.filename
            fileext = os.path.splitext(filename)

            cmd.append(filename)

            if fileext and not fileext[1:] in self.syntax:
                cmd.extend('--syntax', 'css')

        return super().communicate(cmd, code)
