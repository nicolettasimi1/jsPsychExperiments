// PRIN 2023 VST:
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
    waitDur: 1000,
    iti: 1000,
    stimFont: '50px arial',
    stimSize: 50,
};


// 2 counter balanced versions
const version = Number(jsPsych.data.urlVariables().version);
jsPsych.data.addProperties({ version: version });

////////////////////////////////////////////////////////////////////////
//                      Experiment Instructions                       //
////////////////////////////////////////////////////////////////////////
const END_MESSAGE = {
    type: jsPsychHtmlKeyboardResponse,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    stimulus: generate_formatted_html({
        text: `Hai finito! <br><br>
        Ti ringraziamo per aver partecipato a questo studio. <br><br></br>`,
        align: 'left',
        fontsize: 30,
        width: '1200px',
        bold: true,
        lineheight: 1.5,
    }),
};

////////////////////////////////////////////////////////////////////////
//                     Experiment Utilities                           //
////////////////////////////////////////////////////////////////////////
function codeTrial() {
    'use strict';
    let dat = jsPsych.data.get().last(1).values()[0];
    let errorCode;
    errorCode = dat.correct !== dat.answer ? 1 : 0;
    jsPsych.data.addDataToLastTrial({
        date: Date(),
        answer: dat.answer,
        errorCode: errorCode,
    });
}

////////////////////////////////////////////////////////////////////////
//               Stimuli/Timelines                                    //
////////////////////////////////////////////////////////////////////////
function stimuli_factory(items) {

    // Convert answers from comma separated string into array and shuffle the answers
    items.forEach((element, index) => {
        items[index].answers = shuffle(element.answers.split(","));
        items[index].questions = [
            {
                prompt: element.definition,
                name: element.data,
                options: element.answers,
                required: true,
            },
        ]
    });

    // Return shuffled items
    return shuffle(items);
}

const exp_stimuli = stimuli_factory(items);

const TRIAL_STIMULUS = {
    type: jsPsychSurveyMultiChoice,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    questions: jsPsych.timelineVariable('questions'),
    stimulus_data: jsPsych.timelineVariable('data'),
    stimulus_pos: jsPsych.timelineVariable('pos'),
    stimulus_type: jsPsych.timelineVariable('type'),
    stimulus_level: jsPsych.timelineVariable('level'),
    stimulus_definition: jsPsych.timelineVariable('definition'),
    stimulus_answers: jsPsych.timelineVariable('answers'),
    stimulus_correct_answer: jsPsych.timelineVariable('correct'),
    trial_duration: 5000,
    data: {
        stim_type: 'prin_2023_vst',
        data: jsPsych.timelineVariable('data'),
        pos: jsPsych.timelineVariable('pos'),
        type: jsPsych.timelineVariable('type'),
        level: jsPsych.timelineVariable('level'),
        definition: jsPsych.timelineVariable('definition'),
        answers: jsPsych.timelineVariable('answers'),
        correct: jsPsych.timelineVariable('correct'),
    },
    on_finish: function() {
        codeTrial();
    },
};

const WAIT = {
    type: jsPsychHtmlKeyboardResponse,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    stimulus: '',
    response_ends_trial: false,
    trial_duration: PRMS.waitDur,
};

const PAUSE = {
    type: jsPsychHtmlKeyboardResponse,
    canvas_colour: CANVAS_COLOUR,
    canvas_size: CANVAS_SIZE,
    canvas_border: CANVAS_BORDER,
    stimulus: 'Fai una piccola pausa, quando sei pronto premi un tasto per continuare',
    response_ends_trial: true,
};

const TRIAL_TIMELINE = {
    timeline: [TRIAL_STIMULUS],
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
    saveData('/Common/write_data_json.php', data_fn, {stim_type: 'prin_2023_vst'}, 'json');
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
    exp.push(resize_browser("en"));
    exp.push(vpConsentLocal('./consent_italian.html'));
    exp.push(vpInfoFormLocal());

    exp.push(WAIT);

    let block_size = 40;
    let blocks = exp_stimuli.length / block_size
    for (let blk = 0; blk < blocks; blk++) {
        let blk_timeline;
        blk_timeline = { ...TRIAL_TIMELINE };
        blk_timeline.sample = {
            type: 'fixed-repetitions',
            size: 1,
        };
        let blk_stimuli = exp_stimuli.slice(blk * block_size, ((blk+1) * block_size));
        blk_timeline.timeline_variables = blk_stimuli;
        exp.push(blk_timeline);
        exp.push(PAUSE);
    }

    exp.push(SAVE_DATA);

    // debrief
    exp.push(END_MESSAGE);
    exp.push(fullscreen(false));

    return exp;
}
const EXP = genExpSeq();

jsPsych.run(EXP);
