////////////////////////////////////////////////////////////////////////
//                         Canvas Properties                          //
////////////////////////////////////////////////////////////////////////
const canvas_colour = 'rgba(255, 255, 255, 1)';
const canvas_size = [1280, 720];
const canvas_border = '5px solid black';

const target_x_left = 75;
const target_x_right = 1200;
const target_y = 50;

const check_screen = {
  type: 'check-screen-resolution',
  width: canvas_size[0],
  height: canvas_size[1],
  timing_post_trial: 0,
  on_finish: function () {
    reload_if_not_fullscreen();
  },
};

////////////////////////////////////////////////////////////////////////
//                             Experiment                             //
////////////////////////////////////////////////////////////////////////
const expName = getFileName();
const dirName = getDirName();
const vpNum = genVpNum();
getComputerInfo();

////////////////////////////////////////////////////////////////////////
//                           Exp Parameters                           //
////////////////////////////////////////////////////////////////////////
const prms = {
  fbDur: [500, 1500, 3000], // feedback duration for correct and incorrect trials, respectively
  waitDur: 1000,
  iti: 500,
  fixPos: [canvas_size[0] / 2, canvas_size[1] * 0.75], // x,y position of fixation
  fixDur: 500,
  keepFixation: false, // is fixation cross kept on screen with stimulus
  stimFont: '50px arial',
  fbTxt: ['Richtig', 'Falsch'],
  fbFont: '40px Arial',
  cTrl: 1, // count trials
  cBlk: 1, // count trials
  stimPos: [canvas_size[0] / 2, canvas_size[1] * 0.75], // x,y position of stimulus
  respKeys: ['q', 'p'],
};

////////////////////////////////////////////////////////////////////////
//                     Experiment Utilities                           //
////////////////////////////////////////////////////////////////////////
function codeTrial() {
  'use strict';
  let dat = jsPsych.data.get().last(1).values()[0];
  let errorCode;
  errorCode = dat.correct_side !== dat.end_loc ? 1 : 0;
  errorCode = dat.time[0] < prms.fixDur ? 2 : errorCode;
  jsPsych.data.addDataToLastTrial({
    date: Date(),
    errorCode: errorCode,
    blockNum: prms.cBlk,
    trialNum: prms.cTrl,
  });
  prms.cTrl += 1;
}

////////////////////////////////////////////////////////////////////////
//                      Experiment Instructions                       //
////////////////////////////////////////////////////////////////////////
const task_instructions = {
  type: 'html-keyboard-response',
  stimulus:
    "<H1 style = 'text-align: left;'> BITTE NUR TEILNEHMEN, WENN EINE  </H1>" +
    "<H1 style = 'text-align: left;'> COMPUTERMAUS ZUR VERFÜGUNG STEHT </H1> <br>" +
    "<H2 style = 'text-align: left;'> Lieber Teilnehmer/ Liebe Teilnehmerin,  </H2> <br>" +
    "<H3 style = 'text-align: left;'> In diesem Experiment sehen Sie in jedem Durchgang drei Quadrate und zwei Wörter. </H3>" +
    "<H3 style = 'text-align: left;'> Um den Durchgang zu starten, klicken Sie auf das Quadrat unten in der Mitte.  </H3>" +
    "<H3 style = 'text-align: left;'> Danach erscheint ein weiteres Wort auf dem Bildschirm.  </H3> <br>" +
    "<H3 style = 'text-align: left;'> Ihre Aufgabe ist es, das Wort auszuwählen, welches am besten zu dem neuen Wort passt oder mit </H3>" +
    "<H3 style = 'text-align: left;'> ihm in Zusammenhang steht, und den Mauszeiger in das zugehörige Quadrat zu bewegen.  </H3>" +
    "<H3 style = 'text-align: left;'> Bitte reagieren Sie so schnell und korrekt wie möglich. </H3>" +
    "<H3 style = 'text-align: left;'> Zuerst folgt ein Übungsblock, in dem Sie zusätzlich Feedback zu Ihren Antworten erhalten. </H3>" +
    "<H3 style = 'text-align: left;'> Im ersten Teil Übungsblocks sind die beiden Wörter noch nicht zu sehen.</H3>" +
    "<H3 style = 'text-align: left;'> Reagieren Sie nur auf die Anweisung die nach klicken des Quadrats erscheint.</H3>" +
    "<H3 style = 'text-align: left;'> Drücken Sie eine beliebige Taste um fortzufahren! </H3>",
  post_trial_gap: prms.waitDur,
};

const example_start = {
  type: 'html-keyboard-response',
  stimulus:
    "<H2 style = 'text-align: center;'> Jetzt kommen die beiden Wörter dazu. So wird das eigentliche Experiment später aussehen.</H2>" +
    "<H3 style = 'text-align: left;'> Drücken Sie eine beliebige Taste um fortzufahren!  </H3>",
  post_trial_gap: prms.waitDur,
  on_start: function () {
    prms.cBlk += 1;
    prms.cTrl = 1;
  },
};

const exp_start = {
  type: 'html-keyboard-response',
  stimulus:
    "<H1 style = 'text-align: center;'> Jetzt beginnt das eigentliche Experiment </H1>" +
    "<H3 style = 'text-align: left;'> Sie erhalten ab sofort kein Feedback mehr. </H3>" +
    "<H3 style = 'text-align: left;'> Ansonsten ist der Ablauf der gleiche wie in den Übungsdurchgängen gerade eben.</H3>" +
    "<H3 style = 'text-align: left;'> Zur Erinnerung:   </H3>" +
    "<H3 style = 'text-align: left;'> 1. Quadrat unten in der Mitte anklicken </H3>" +
    "<H3 style = 'text-align: left;'> 2. Mauszeiger in das Quadrat bewegen, dessen Wort am besten zu dem neuen Wort passt/mit ihm zusammenhängt  </H3>" +
    "<H3 style = 'text-align: left;'> Bitte reagieren Sie so schnell und korrekt wie möglich!  </H3>" +
    "<H3 style = 'text-align: left;'> Drücken Sie eine beliebige Taste um fortzufahren!  </H3>",
  post_trial_gap: prms.waitDur,
  on_start: function () {
    prms.cBlk += 1;
    prms.cTrl = 1;
  },
};

////////////////////////////////////////////////////////////////////////
//               Stimuli/Timelines                                    //
////////////////////////////////////////////////////////////////////////
function stimuli_factory(items_ambiguous, items_unambiguous) {
  item_numbers_ambiguous = randomSelection(range(0, items_ambiguous.length), items_ambiguous.length / 2);
  item_numbers_unambiguous = range(0, items_unambiguous.length).filter((x) => !item_numbers_ambiguous.includes(x));
  // console.log(item_numbers_ambiguous);
  // console.log(item_numbers_unambiguous);

  let stimuli = [];
  let correct_side;

  correct_side = shuffle(repeatArray(['left', 'right'], item_numbers_ambiguous.length / 2));
  for (let [idx, item] of item_numbers_ambiguous.entries()) {
    let stimulus = {};
    stimulus.probe_type = items_ambiguous[item].type;
    stimulus.probe = items_ambiguous[item].probe;
    if (correct_side[idx] === 'right') {
      stimulus.right = items_ambiguous[item].target_rel_text;
      stimulus.left = items_ambiguous[item].target_unrel_text;
      stimulus.correct_side = 'right';
    } else if (correct_side[idx] === 'left') {
      stimulus.right = items_ambiguous[item].target_unrel_text;
      stimulus.left = items_ambiguous[item].target_rel_text;
      stimulus.correct_side = 'left';
    }
    x_pos_rand = shuffle([target_x_left, target_x_right])
    stimulus.targets_text = [];
    stimulus.targets_text.push(
      { text: items_ambiguous[item].target_rel_text, x: x_pos_rand[0], y: target_y, color: 'black' },
    );
    stimulus.targets_text.push(
      { text: items_ambiguous[item].target_unrel_text, x: x_pos_rand[1], y: target_y, color: 'black' },
    );
    stimuli.push(stimulus);
  }

  correct_side = shuffle(repeatArray(['left', 'right'], item_numbers_unambiguous.length / 2));
  for (let [idx, item] of item_numbers_unambiguous.entries()) {
    let stimulus = {};
    stimulus.probe_type = items_unambiguous[item].type;
    stimulus.probe = items_unambiguous[item].probe;
    if (correct_side[idx] === 'right') {
      stimulus.right = items_unambiguous[item].target_rel_text;
      stimulus.left = items_unambiguous[item].target_unrel_text;
      stimulus.correct_side = 'right';
    } else if (correct_side[idx] === 'left') {
      stimulus.right = items_unambiguous[item].target_unrel_text;
      stimulus.left = items_unambiguous[item].target_rel_text;
      stimulus.correct_side = 'left';
    }
    x_pos_rand = shuffle([target_x_left, target_x_right])
    stimulus.targets_text = [];
    stimulus.targets_text.push(
      { text: items_unambiguous[item].target_rel_text, x: x_pos_rand[0], y: target_y, color: 'black' },
    );
    stimulus.targets_text.push(
      { text: items_unambiguous[item].target_unrel_text, x: x_pos_rand[1], y: target_y, color: 'black' },
    );
    stimuli.push(stimulus);
  }

  stimuli = shuffle(stimuli);
  // console.log(stimuli);
  return stimuli;
}

const example_stimuli = stimuli_factory(example_items_ambiguous, example_items_unambiguous);
const exp_stimuli = stimuli_factory(items_ambiguous, items_unambiguous);

const trial_stimulus = {
  type: 'multi-text-keyboard-response',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  fixation_duration: prms.fixDur,
  fixation_position: prms.fixPos,
  keep_fixation: false,
  stimulus: jsPsych.timelineVariable('probe'),
  stimulus_position: prms.stimPos,
  stimulus_colour: 'black',
  stimulus_font: prms.stimFont,
  targets_start_delay: 1000,
  targets_text: jsPsych.timelineVariable('targets_text'),
  choices: prms.respKeys,
  data: {
    stim_type: 'cse_ambiguity_keyboard',
    probe: jsPsych.timelineVariable('probe'),
    probe_type: jsPsych.timelineVariable('type'),
    targets_text: jsPsych.timelineVariable('targets_text'),
  },
};

const flanker_fixation_cross = {
  type: 'html-keyboard-response',
  stimulus: '<div style="font-size:60px;">+</div>',
  response_ends_trial: false,
  trial_duration: prms.fixDur,
};

const flanker_stimulus = {
  type: 'html-keyboard-response',
  stimulus: jsPsych.timelineVariable('stimulus'),
  response_ends_trial: true,
  choices: prms.respKeys,
  data: {
    stim_type: 'flanker',
    type: jsPsych.timelineVariable('type'),
    direction: jsPsych.timelineVariable('direction'),
    stimulus: jsPsych.timelineVariable('stimulus'),
  },
  on_finish: function () {
    prms.cTrl += 1;
  },
};

const iti = {
  type: 'static-canvas-keyboard-response',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  trial_duration: prms.iti,
  response_ends_trial: false,
  func: function () {},
};

// For VP Stunden
const randomString = generateRandomStringWithExpName('csemt_', 16);

const alphaNum = {
  type: 'html-keyboard-response-canvas',
  canvas_colour: canvas_colour,
  canvas_size: canvas_size,
  canvas_border: canvas_border,
  response_ends_trial: true,
  choices: [' '],
  stimulus: generate_formatted_html({
    text:
      `Vielen Dank für Ihre Teilnahme.<br><br>
        Wenn Sie Versuchspersonenstunden benötigen, kopieren Sie den folgenden
        zufällig generierten Code und senden Sie diesen zusammen mit Ihrer
        Matrikelnummer per Email mit dem Betreff 'Versuchpersonenstunde'
        an:<br><br>m.zeller@student.uni-tuebingen.de<br> Code: ` +
      randomString +
      `<br><br>Drücken Sie die Leertaste, um fortzufahren!`,
    fontsize: 28,
    lineheight: 1.0,
    align: 'left',
  }),
};

////////////////////////////////////////////////////////////////////////
//                                Save                                //
////////////////////////////////////////////////////////////////////////
const save_data = {
  type: 'call-function',
  func: function () {
    let data_filename = dirName + 'data/' + expName + '_' + vpNum;
    saveData('/Common/write_data_json.php', data_filename, { stim_type: 'cse_ambiguity_button' }, 'json');
  },
  timing_post_trial: 2000,
};

const save_interaction_data = {
  type: 'call-function',
  func: function () {
    let data_filename = dirName + 'interaction_data/' + expName + '_' + vpNum;
    saveInteractionData('/Common/write_data.php', data_filename);
  },
  timing_post_trial: 200,
};

const save_code = {
  type: 'call-function',
  func: function () {
    let code_filename = dirName + 'code/' + expName;
    saveRandomCode('/Common/write_code.php', code_filename, randomString);
  },
  timing_post_trial: 200,
};

////////////////////////////////////////////////////////////////////////
//                    Generate and run experiment                     //
////////////////////////////////////////////////////////////////////////

const example_timeline = {
  timeline_variables: example_stimuli,
  timeline: [trial_stimulus, iti],
  randomize_order: true,
};

const exp_timeline = {
  timeline_variables: exp_stimuli,
  timeline: [trial_stimulus, iti],
  randomize_order: true,
};

function genExpSeq() {
  'use strict';

  let exp = [];

  exp.push(fullscreen_on);
  exp.push(check_screen);
  exp.push(welcome_de);
  exp.push(resize_de);
  exp.push(vpInfoForm_de);
  exp.push(task_instructions);

  exp.push(exp_start);
  // Build sections made of CSE Ambiguity and Flanker trials
  let cse_stimulus_per_section = 3;
  let sections = example_stimuli.length / cse_stimulus_per_section;
  for (let section = 0; section < sections; section++) {
    // CSE Ambiguity trials
    exp.push({
      timeline_variables: example_stimuli.splice(0,cse_stimulus_per_section),
      timeline: [trial_stimulus, iti],
      randomize_order: true,
    });
    let flankers = [];
    for (let i = 0; i < cse_stimulus_per_section; i++) {
      flankers.push(shuffle(flanker_items)[0]);
    }
    // Flanker trials
    exp.push({
      timeline_variables: flankers,
      timeline: [flanker_fixation_cross, flanker_stimulus],
      randomize_order: true,
    });
  }

  // save data
  exp.push(save_data);
  exp.push(save_interaction_data);
  exp.push(save_code);

  // debrief
  exp.push(debrief_de);
  exp.push(alphaNum);
  exp.push(fullscreen_off);

  return exp;
}
const EXP = genExpSeq();

jsPsych.init({
  timeline: EXP,
  on_interaction_data_update: function (data) {
    update_user_interaction_data(data);
  },
});
