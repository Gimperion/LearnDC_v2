/*jslint node: true*/
/*jslint sloppy: true*/
/*jslint nomen: true*/
/*global describe, before, it*/

var _ = require('lodash'),
    assert = require('assert'),
    fs = require('fs'),
    glob = require('glob');

var EXPORT = 'Export/JSON/';

var EXHIBITS = [
    'amo_targets.json',
    'attendance.json',
    'dccas.json',
    'enrollment_equity.json',
    'enrollment.json',
    'expulsions.json',
    'graduation.json',
    'mgp_scores.json',
    'mid_year_entry_and_withdrawal.json',
    'sped_apr.json',
    'suspensions.json',
    'unexcused_absences.json'
];

function removeHiddenFiles(list) {
    return _.filter(list, function (item) {
        return item[0] !== '.';
    });
}

describe('LearnDC data files', function () {
    var jsonFiles = glob.sync(EXPORT + '/**/*.+(json|JSON)');

    describe('Directory structure', function () {

        it('should have a school, lea and state directory', function (done) {
            fs.readdir(EXPORT, function (err, list) {
                if (err) { throw err; }
                list = removeHiddenFiles(list);
                if (list.length === 3 || _.difference(list, ['school', 'lea', 'state']).length === 3) {
                    done();
                }
            });
        });

        it('school directories should be four-digit codes', function (done) {
            fs.readdir(EXPORT + 'school', function (err, list) {
                if (err) { throw err; }
                list = removeHiddenFiles(list);
                _.each(list, function (file) {
                    if (file.length !== 4 || isNaN(parseInt(file, 10))) {
                        throw new Error('School code ' + file + ' is not a four digit number.');
                    }
                });
                done();
            });
        });

        it('lea directories should be four-digit codes', function (done) {
            fs.readdir(EXPORT + 'lea', function (err, list) {
                if (err) { throw err; }
                list = removeHiddenFiles(list);
                _.each(list, function (file) {
                    if (file.length !== 4 || isNaN(parseInt(file, 10))) {
                        throw new Error('LEA code ' + file + ' is not a four digit number.');
                    }
                });
                done();
            });
        });

        it('state data should be in a folder called "DC"', function (done) {
            fs.readdir(EXPORT + 'state', function (err, list) {
                if (err) { throw err; }
                list = removeHiddenFiles(list);
                if (list.length !== 1) { throw new Error('There are multiple directories in "state".'); }
                if (list[0] !== 'DC') { throw new Error('State directory should be named "DC".'); }
                done();
            });
        });
    });

    _.each(jsonFiles, function (file) {
        describe(file, function () {
            var parseError, data,
                filename = _.last(file.split('/')),
                json = fs.readFileSync(file);

            try {
                data = JSON.parse(json);
            } catch (e) {
                parseError = new Error('File is not valid JSON. ' + e);
            }

            it('should be valid JSON', function () {
                if (parseError) { throw parseError; }
            });

            it('should be in a subdirectory', function () {
                assert.equal(file.split('/').length, 5);
            });

            it('should match a known exhibit type', function () {
                assert.equal(_.difference([filename], EXHIBITS).length, 0);
            });

            function validSubgroups() {
                it('should have valid subgroups', function () {
                    var subgroups = [
                        'all',
                        'male', 'female',
                        'bl7', 'wh7', 'hi7', 'as7', 'pi7', 'am7', 'mu7',
                        'sped', 'lep', 'economy', 'direct cert',
                        'sped level 1', 'sped level 2', 'sped level 3', 'sped level 4'
                    ];
                    _.each(data.exhibit.data, function (obj) {
                        if (!_.contains(subgroups, obj.key.subgroup.toLowerCase())) {
                            throw new Error(obj.key.subgroup + ' is not a valid subgroup.');
                        }
                    });
                });
            }

            if (!parseError) {
                switch (filename) {
                case 'amo_targets.json':
                    break;
                case 'attendance.json':
                    validSubgroups();
                    break;
                case 'dccas.json':
                    validSubgroups();
                    break;
                case 'enrollment_equity.json':
                    validSubgroups();
                    break;
                case 'enrollment.json':
                    validSubgroups();
                    break;
                case 'expulsions.json':
                    break;
                case 'graduation.json':
                    validSubgroups();
                    break;
                case 'mgp_scores.json':
                    validSubgroups();
                    break;
                case 'mid_year_entry_and_withdrawal.json':
                    break;
                case 'sped_apr.json':
                    break;
                case 'suspensions.json':
                    validSubgroups();
                    break;
                case 'unexcused_absences.json':
                    validSubgroups();
                    break;
                }
            }
        });
    });
});