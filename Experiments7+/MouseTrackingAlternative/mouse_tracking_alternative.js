// MouseTrackingAlternative:
// ...

const jsPsych = initJsPsych({});

////////////////////////////////////////////////////////////////////////
//                         Canvas Properties                          //
////////////////////////////////////////////////////////////////////////
const CANVAS_COLOUR = 'rgba(255, 255, 255, 1)';
const CANVAS_SIZE = [1280, 720];
const CANVAS_BORDER = '5px solid black';

////////////////////////////////////////////////////////////////////////
//                           Exp Parameters                           //
////////////////////////////////////////////////////////////////////////
const PRMS = {
    nTrlsP: 2, //8, // number of trials in practice blocks
    nTrlsE: 48, // number of trials in subsequent blocks
    nBlks: 2, //6,
    fbDur: [500, 500, 3000], // feedback duration for correct and incorrect trials, respectively
    waitDur: 1000,
    iti: 1000,
    fixPos: [CANVAS_SIZE[0] / 2, CANVAS_SIZE[1] * 0.75], // x,y position of stimulus
    fixDur: 500,
    stimPos: [CANVAS_SIZE[0] / 2, CANVAS_SIZE[1] * 0.75], // x,y position of stimulus
    startBox: [CANVAS_SIZE[0] / 2, CANVAS_SIZE[1] * 0.9, 50, 50], // xpos, ypos, xsize, ysize
    leftBox: [150, 150, 250, 250], // xpos, ypos, xsize, ysize
    rightBox: [1130, 150, 250, 250], // xpos, ypos, xsize, ysize
    leftImageAnchor: [150, 150],
    rightImageAnchor: [1130, 150],
    keepFixation: false, // is fixation cross kept on screen with stimulus
    drawStartBox: [true, true, true], // draw response boxes at trial initiation, fixation cross, and response execution stages
    drawResponseBoxes: [true, true, true], // draw response boxes at trial initiation, fixation cross, and response execution stages
    drawResponseBoxesImage: [false, false, true], // draw response boxes at trial initiation, fixation cross, and response execution stages
    boxLineWidth: 5, // linewidth of the start/target boxes
    requireMousePressStart: true, // is mouse button press inside start box required to initiate trial?
    requireMousePressFinish: false, // is mouse button press inside response box required to end trial?
    stimFont: '50px arial',
    stimSize: 50,
    fbTxt: ['Richtig', 'Falsch'],
    fbFont: '40px monospace',
    cTrl: 1, // count trials
    cBlk: 1, // count blocks
    trial_duration: 5000,
};


// 2 counter balanced versions
const version = Number(jsPsych.data.urlVariables().version);
jsPsych.data.addProperties({ version: version });

////////////////////////////////////////////////////////////////////////
//                      Experiment Instructions                       //
////////////////////////////////////////////////////////////////////////
const WELCOME_INSTRUCTIONS = {
    type: jsPsychHtmlKeyboardResponseCanvas,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    stimulus: generate_formatted_html({
        text: `Willkommen zu unserem Experiment:<br><br>
           Die Teilnahme ist freiwillig und du darfst das Experiment jederzeit abbrechen.
           Bitte stelle sicher, dass du dich in einer ruhigen Umgebung befindest und genügend Zeit hast,
           um das Experiment durchzuführen. Wir bitten dich die ca. nächsten 15 Minuten konzentriert zu arbeiten.<br><br>
           Drücke eine beliebige Taste, um fortzufahren`,
        align: 'left',
        fontsize: 30,
        width: '1200px',
        bold: true,
        lineheight: 1.5,
    }),
};

const MOUSE_INSTRUCTIONS = {
    type: jsPsychHtmlKeyboardResponseCanvas,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    stimulus: generate_formatted_html({
        text: `BITTE NUR TEILNEHMEN, WENN EINE </H1>
        COMPUTERMAUS ZUR VERFÜGUNG STEHT! </H1> <br><br>
        Lieber Teilnehmer/ Liebe Teilnehmerin,</H2><br>
        In diesem Experiment sehen Sie in jedem Durchgang drei Quadrate.    </H3><br>
        Um den Durchgang zu starten, klicken Sie auf das Quadrat unten in der Mitte.   </H3><br>
        Danach erscheinen zwei Bilder und ein Ausdruck auf dem Bildschirm.  </H3><br>
        Ihre Aufgabe ist es, das Bild auszuwählen, das am besten zu dem   </H3><br>
        Ausdruck passt und den Mauszeiger in das zugehörige Quadrat zu bewegen.   </H3><br>
        Bitte reagieren Sie so schnell und so korrekt wie möglich.   </H3><br>
        Zuerst folgt ein Übungsblock, indem Sie zusätzlich Feedback zu Ihren Antworten erhalten. </H3><br>
        Im ersten Teil des Übungsblocks werden noch keine Bilder zu sehen sein. </H3><br>
        Reagieren Sie nur auf die Anweisung die nach klicken des Quadrats erscheint. </H3><br><br>
        Drücken Sie eine beliebige Taste, um fortzufahren!`,
        align: 'left',
        fontsize: 30,
        width: '1200px',
        bold: true,
        lineheight: 1.5,
    }),
};

const TASK_INSTRUCTIONS = {
    type: jsPsychHtmlKeyboardResponseCanvas,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    stimulus: generate_formatted_html({
        text: `Jetzt beginnt das eigentliche Experiment <br><br>
        Sie erhalten ab sofort kein Feedback mehr. <br>
        Ansonsten ist der Ablauf der gleiche wie in den Übungsdurchgängen gerade eben. <br><br>
        Zur Erinnerung:   <br>
        1. Quadrat unten in der Mitte anklicken <br>
        2. Mauszeiger in das Quadrat bewegen, dessen Bild am besten zu dem Ausdruck passt/mit ihm zusammenhängt <br><br>
        Bitte reagieren Sie so schnell und korrekt wie möglich!  <br> <br>
        Drücken Sie eine beliebige Taste um fortzufahren!`,
        align: 'center',
        fontsize: 30,
        width: '1200px',
        bold: true,
        lineheight: 1.5,
    }),
};


////////////////////////////////////////////////////////////////////////
//                     Experiment Utilities                           //
////////////////////////////////////////////////////////////////////////
function drawFeedback(should_answer) {
    'use strict';
    let ctx = document.getElementById('canvas').getContext('2d');
    let dat = jsPsych.data.get().last(1).values()[0];
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';

    let xpos;
    let ypos;
    if (should_answer) {
        if (dat.end_loc === 'left') {
            xpos = PRMS.leftBox[0] + 25;
            ypos = PRMS.leftBox[1];
        } else if (dat.end_loc === 'right') {
            xpos = PRMS.rightBox[0] - 25;
            ypos = PRMS.rightBox[1];
        } else {
            // Fallback to mouse coords
            xpos = dat.end_x;
            ypos = dat.end_y;
        }
    }

    if (dat.errorCode === 2) {
        ctx.fillText('Warte in dem Quadrat bis das Wort kommt!', CANVAS_SIZE[0] / 2, CANVAS_SIZE[1] / 2);
    } else {
        ctx.fillText(PRMS.fbTxt[dat.errorCode], xpos, ypos);
    }
}

function drawFeedbackFull() {
    return drawFeedback(should_answer = true);
}

function drawFeedbackErrorOnly() {
    return drawFeedback(should_answer = false);
}

function codeTrial() {
    'use strict';
    let dat = jsPsych.data.get().last(1).values()[0];
    let idx = dat.y_coords.findIndex(function(pos) {
        return pos < 615;
    });
    let errorCode;
    errorCode = dat.correct_side !== dat.end_loc ? 1 : 0;
    errorCode = dat.time[idx] < PRMS.fixDur ? 2 : errorCode;
    jsPsych.data.addDataToLastTrial({
        date: Date(),
        errorCode: errorCode,
        blockNum: PRMS.cBlk,
        trialNum: PRMS.cTrl,
    });
    PRMS.cTrl += 1;
}

////////////////////////////////////////////////////////////////////////
//               Stimuli/Timelines                                    //
////////////////////////////////////////////////////////////////////////
function stimuli_factory(items) {

    let stimuli = [];
    let items_shuffled;
    let target_1_side;
    let correct_side;

    items_shuffled = shuffle(items);
    target_1_side = shuffle(repeatArray(['left', 'right'], items.length / 2));
    for (let [idx, item] of items_shuffled.entries()) {
        let stimulus = item;
        stimulus.probe_type = item.polarity;
        stimulus.probe = item.sentence;
        stimulus.correct_side = null;

        switch(item.condition && item.polarity) {
            case 'alternative_repetition' && 'aff':
                correct_side = item.target_1_relation === 'repetition' ? 'target_1' : 'target_2';
                break;
            case 'alternative_repetition' && 'neg':
                correct_side = item.target_1_relation === 'alternative' ? 'target_1' : 'target_2';
                break;
            case 'related_repetition' && 'aff':
                correct_side = item.target_1_relation === 'repetition' ? 'target_1' : 'target_2';
                break;
            case 'related_repetition' && 'neg':
                correct_side = item.target_1_relation === 'related' ? 'target_1' : 'target_2';
                break;
            default:
                throw('Condition set not found. Condition: ' + item.condition + '. Polarity: ' + item.polarity);
        }

        if (target_1_side[idx] === 'right') {
            stimulus.right = pathJoin([image_directory, item.target_1_pic]);
            stimulus.left = pathJoin([image_directory, item.target_2_pic]);
            stimulus.right_relation = item.target_1_relation;
            stimulus.left_relation = item.target_2_relation;
            stimulus.correct_side = correct_side === 'target_1' ? 'right' : 'left'
        } else if (target_1_side[idx] === 'left') {
            stimulus.right = pathJoin([image_directory, item.target_2_pic]);
            stimulus.left = pathJoin([image_directory, item.target_1_pic]);
            stimulus.right_relation = item.target_2_relation;
            stimulus.left_relation = item.target_1_relation;
            stimulus.correct_side = correct_side === 'target_1' ? 'left' : 'right'
        }
        stimuli.push(stimulus);
    }

    return stimuli;
}
// prettier-ignore
const training_stimuli = [
    { probe: 'Nach links', target_rel_text: '', probe_type: null, correct_side: 'left' },
    { probe: 'Nach rechts', target_rel_text: '', probe_type: null, correct_side: 'right' },
    { probe: 'Nach links', target_rel_text: '', probe_type: null, correct_side: 'left' },
    { probe: 'Nach rechts', target_rel_text: '', probe_type: null, correct_side: 'right' },
    { probe: 'Nach links', target_rel_text: '', probe_type: null, correct_side: 'left' },
    { probe: 'Nach rechts', target_rel_text: '', probe_type: null, correct_side: 'right' },
    { probe: 'Nach links', target_rel_text: '', probe_type: null, correct_side: 'left' },
    { probe: 'Nach rechts', target_rel_text: '', probe_type: null, correct_side: 'right' },
    { probe: 'Nach links', target_rel_text: '', probe_type: null, correct_side: 'left' },
    { probe: 'Nach rechts', target_rel_text: '', probe_type: null, correct_side: 'right' },
];

const exp_stimuli = stimuli_factory(items);

// images
function image_array(x) {
    'use strict';
    let images = [];
    for (let i = 0; i < x.length; i++) {
        images.push(x[i].right);
        images.push(x[i].left);
    }
    return images;
}

const IMAGES = {
    type: jsPsychPreload,
    auto_preload: true,
    images: image_array(exp_stimuli),
};

const TRAINING_STIMULUS = {
    type: jsPsychMouseImageResponse,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    fixation_duration: PRMS.fixDur,
    fixation_position: PRMS.fixPos,
    stimulus: jsPsych.timelineVariable('probe'),
    stimulus_type: jsPsych.timelineVariable('probe_type'),
    stimulus_position: PRMS.stimPos,
    stimulus_colour: jsPsych.timelineVariable('probe_colour'),
    stimulus_font: PRMS.stimFont,
    start_box: PRMS.startBox,
    left_box: PRMS.leftBox,
    right_box: PRMS.rightBox,
    left_box_colour: 'gray',
    right_box_colour: 'gray',
    left_image: jsPsych.timelineVariable('left'),
    right_image: jsPsych.timelineVariable('right'),
    left_image_anchor: PRMS.leftImageAnchor,
    right_image_anchor: PRMS.rightImageAnchor,
    keep_fixation: PRMS.keepFixation,
    draw_start_box: PRMS.drawStartBox,
    draw_response_boxes: PRMS.drawResponseBoxes,
    draw_response_boxes_image: PRMS.drawResponseBoxesImage,
    box_linewidth: PRMS.boxLineWidth,
    require_mouse_press_start: PRMS.requireMousePressStart,
    require_mouse_press_finish: PRMS.requireMousePressFinish,
    trial_duration: null,
    data: {
        stim_type: 'affneg',
        probe: jsPsych.timelineVariable('probe'),
        probe_type: jsPsych.timelineVariable('probe_type'),
        left: jsPsych.timelineVariable('left'),
        right: jsPsych.timelineVariable('right'),
        correct_side: jsPsych.timelineVariable('correct_side'),
    },
    on_finish: function() {
        codeTrial();
    },
};

const TRIAL_STIMULUS = {
    type: jsPsychMouseImageResponse,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    fixation_duration: PRMS.fixDur,
    fixation_position: PRMS.fixPos,
    stimulus: jsPsych.timelineVariable('probe'),
    stimulus_type: jsPsych.timelineVariable('probe_type'),
    stimulus_position: PRMS.stimPos,
    stimulus_colour: jsPsych.timelineVariable('probe_colour'),
    stimulus_font: PRMS.stimFont,
    start_box: PRMS.startBox,
    left_box: PRMS.leftBox,
    right_box: PRMS.rightBox,
    left_box_colour: 'gray',
    right_box_colour: 'gray',
    left_image: jsPsych.timelineVariable('left'),
    right_image: jsPsych.timelineVariable('right'),
    left_image_anchor: PRMS.leftImageAnchor,
    right_image_anchor: PRMS.rightImageAnchor,
    keep_fixation: PRMS.keepFixation,
    draw_start_box: PRMS.drawStartBox,
    draw_response_boxes: PRMS.drawResponseBoxes,
    draw_response_boxes_image: PRMS.drawResponseBoxesImage,
    box_linewidth: PRMS.boxLineWidth,
    require_mouse_press_start: PRMS.requireMousePressStart,
    require_mouse_press_finish: PRMS.requireMousePressFinish,
    trial_duration: PRMS.trial_duration,
    data: {
        stim_type: 'affneg',
        probe: jsPsych.timelineVariable('probe'),
        probe_type: jsPsych.timelineVariable('probe_type'),
        left: jsPsych.timelineVariable('left'),
        right: jsPsych.timelineVariable('right'),
        correct_side: jsPsych.timelineVariable('correct_side'),
    },
    on_finish: function() {
        codeTrial();
    },
};

const TRAINING_FEEDBACK = {
    type: jsPsychStaticCanvasKeyboardResponse,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    trial_duration: null,
    translate_origin: false,
    func: drawFeedbackFull,
    on_start: function(trial) {
        let dat = jsPsych.data.get().last(1).values()[0];
        trial.trial_duration = PRMS.fbDur[dat.errorCode];
    },
};

const TRIAL_FEEDBACK = {
    type: jsPsychStaticCanvasKeyboardResponse,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    trial_duration: null,
    translate_origin: false,
    func: drawFeedbackErrorOnly,
    on_start: function(trial) {
        let dat = jsPsych.data.get().last(1).values()[0];
        trial.trial_duration = PRMS.fbDur[dat.errorCode];
    },
};

const WAIT = {
    type: jsPsychHtmlKeyboardResponseCanvas,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    stimulus: '',
    response_ends_trial: false,
    trial_duration: PRMS.waitDur,
};

const ITI = {
    type: jsPsychHtmlKeyboardResponseCanvas,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    stimulus: '',
    response_ends_trial: false,
    trial_duration: PRMS.iti,
};

const TRAINING_TIMELINE = {
    timeline_variables: training_stimuli,
    timeline: [TRAINING_STIMULUS, TRAINING_FEEDBACK, ITI],
    randomize_order: true,
    sample: {
        type: 'fixed-repetitions',
        size: 1,
    },
};

const TRIAL_TIMELINE = {
    timeline: [TRIAL_STIMULUS, TRIAL_FEEDBACK, ITI],
    randomize_order: true,
};

////////////////////////////////////////////////////////////////////////
//                              Save                                  //
////////////////////////////////////////////////////////////////////////
const DIR_NAME = getDirName();
const EXP_NAME = getFileName();

function save() {
    const vpNum = getTime();
    jsPsych.data.addProperties({ vpNum: vpNum });

    const data_fn = `${DIR_NAME}data/${EXP_NAME}_${vpNum}`;
    saveData('/Common/write_data_json.php', data_fn, { stim_type: 'affneg' }, 'json');
    // saveDataLocal(data_fn, { stim_type: 'affneg' }, 'json');
}

const SAVE_DATA = {
    type: jsPsychCallFunction,
    func: save,
    post_trial_gap: 1000,
};

////////////////////////////////////////////////////////////////////////
//                    Generate and run experiment                     //
////////////////////////////////////////////////////////////////////////
function genExpSeq() {
    'use strict';

    let exp = [];

    exp.push(fullscreen(true));
    exp.push(browser_check(PRMS.screenRes));
    exp.push(IMAGES);
    exp.push(resize_browser());
    exp.push(welcome_message());
    exp.push(vpInfoForm());
    exp.push(WELCOME_INSTRUCTIONS);
    exp.push(WAIT);
    exp.push(MOUSE_INSTRUCTIONS);
    exp.push(WAIT);

    exp.push(TRAINING_TIMELINE);

    exp.push(TASK_INSTRUCTIONS);
    exp.push(WAIT);
    // This construct allow for multiple blocks
    // We need only one block but we keep it this way for future changes
    let blk_timeline;
    blk_timeline = { ...TRIAL_TIMELINE };
    blk_timeline.sample = {
        type: 'fixed-repetitions',
        size: 1,
    };
    blk_timeline.timeline_variables = exp_stimuli;
    exp.push(blk_timeline); // trials within a block

    exp.push(WAIT);

    exp.push(SAVE_DATA);

    // debrief
    exp.push(end_message());
    exp.push(fullscreen(false));

    return exp;
}
const EXP = genExpSeq();

jsPsych.run(EXP);
