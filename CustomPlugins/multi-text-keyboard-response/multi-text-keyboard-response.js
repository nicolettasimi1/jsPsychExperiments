// Present multiple text element in different positions and a single stimulus
//   Text_1               Text_2
//
//                   Text_3
// 
//              +
//
//              SB

jsPsych.plugins['multi-text-keyboard-response'] = (function () {
  let plugin = {};

  plugin.info = {
    name: 'multi-text-keyboard-response',
    description: '',
    parameters: {
      func_args: {
        type: jsPsych.plugins.parameterType.OBJECT,
        array: true,
        pretty_name: 'Args',
        default: {},
        description: 'Function arguments',
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.',
      },
      canvas_colour: {
        type: jsPsych.plugins.parameterType.STRING,
        array: false,
        pretty_name: 'Canvas Colour',
        default: 'white',
        description: 'Canvas Colour.',
      },
      canvas_size: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        pretty_name: 'Canvas Size',
        default: [1280, 960],
        description: 'Canvas Size.',
      },
      canvas_border: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Border Style',
        default: '0px solid black',
        description: 'Border Style',
      },
      draw_fixation: {
        type: jsPsych.plugins.parameterType.BOOL,
        array: true,
        pretty_name: 'Draw Fixation Cross',
        default: true,
        description: 'Draw Fixation Cross',
      },
      fixation_position: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        pretty_name: 'Fixation Position',
        default: [0, 0],
        description: 'Fixation Position',
      },
      fixation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        array: false,
        pretty_name: 'Fixation Duration',
        default: 500,
        description: 'Fixation Duration',
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimulus',
        default: 'Hello, world!',
        description: 'Stimulus',
      },
      stimulus_position: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus Position',
        default: [0, 0],
        description: 'Stimulus Position',
      },
      stimulus_colour: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimulus Colour',
        default: 'black',
        description: 'Stimulus Colour',
      },
      stimulus_font: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimulus Font',
        default: '50px monospace',
        description: 'Stimulus Font',
      },
      targets_start_delay: {
        type: jsPsych.plugins.parameterType.INT,
        array: false,
        pretty_name: 'Targets Start Delay',
        default: 500,
        description: 'Targets start Delay',
      },
      targets_text: {
        type: jsPsych.plugins.parameterType.OBJECT,
        array: true,
        pretty_name: 'Text Elements',
        default: [
          { text: '', x: 0, y: 0, color: '' },
        ],
        description: 'List of text elements with their x,y positions and color',
      },
      keep_fixation: {
        type: jsPsych.plugins.parameterType.BOOL,
        array: true,
        pretty_name: 'Keep Fxation Cross',
        default: true,
        description: 'Keep Fixation Cross with Stimulus Presentation',
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial Duration',
        default: null,
        description: 'How long to show trial before it ends.',
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.',
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.',
      },
    },
  };

  plugin.trial = function (display_element, trial) {
    // setup canvas
    let new_html =
      '<div>' +
      '<div style="position:relative;">' +
      '<canvas id="canvas" width="' +
      trial.canvas_size[0] +
      '" height="' +
      trial.canvas_size[1] +
      '" style="border: ' +
      trial.canvas_border +
      ';"></canvas>' +
      '</div>';

    display_element.innerHTML = new_html;
    let canvas = document.getElementById('canvas');
    let ctx = document.getElementById('canvas').getContext('2d');

    // stimulus font properties
    ctx.font = trial.stimulus_font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // flags for drawing
    let draw_fixation = trial.draw_fixation;
    let draw_stimulus = false;
    
    // initial draw
    draw();

    // functions
    // clear the canvas and draw text
    function draw() {
      'use strict';
      // canvas
      ctx.fillStyle = trial.canvas_colour;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // fixation cross
      if (draw_fixation) {
        ctx.fillStyle = "black"; // trial.stimulus_colour;
        ctx.fillText('+', trial.fixation_position[0], trial.fixation_position[1]);
        jsPsych.pluginAPI.setTimeout(function() {
          draw_fixation = trial.keep_fixation;
          draw_stimulus = true;
          draw();
        }, trial.fixation_duration);
      }

      // draw stimulus after fixation or when it is not drawn
      if (!draw_fixation || draw_stimulus) {
        ctx.fillStyle = trial.stimulus_colour;
        ctx.fillText(trial.stimulus, trial.stimulus_position[0], trial.stimulus_position[1]);
      }

      jsPsych.pluginAPI.setTimeout(function() {
        if (trial.targets_text !== undefined && trial.targets_text.length !== 0) {
          for (const target of trial.targets_text) {
            // Align text depending in its position on the canvas.
            if (target.x < trial.canvas_size[0] / 2) {
              ctx.textAlign = 'left';
            } else {
              ctx.textAlign = 'right';
            }
            ctx.fillStyle = target.color;
            ctx.fillText(target.text, target.x, target.y);
          }
        }
      }, trial.targets_start_delay);

    }

    // store response
    let response = {
      rt: null,
      key: null,
    };

    // function to end trial when it is time
    let end_trial = () => {
      'use strict';

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }
      
      // gather the data to store for the trial
      let trial_data = {
        rt: response.rt,
        targets_text: trial.targets_text,
        stimulus: trial.stimulus,
        key_press: response.key,
      };
      
      // cleat the display and move on to the next trial
      display_element.innerHTML = '';
      jsPsych.finishTrial(trial_data);
    };
    
    let after_response = function (info) {
      // only record the first response
      if (response.key == null) {
        response = info;
      }
      
      if (trial.response_ends_trial) {
        end_trial();
      }
    };
    
    // start the response listener
    if (trial.choices !== jsPsych.NO_KEYS) {
      let keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function () {
        display_element.querySelector('#stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
  }

  return plugin;
})();
