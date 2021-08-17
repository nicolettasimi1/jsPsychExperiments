image_directory = 'images'

const items = shuffle([
    {is_control: false, probe: 'Absatz', probe_type: 'ambiguous', congruent: pathJoin([image_directory, 'schuhsohle_target_cong.jpeg']), incongruent: pathJoin([image_directory, 'buch_target_incong.jpeg']), control: pathJoin([image_directory, 'sport_unrelated.jpeg'])},
    {is_control: true, probe: 'Tennis', probe_type: 'ambiguous', congruent: pathJoin([image_directory,'schuhsohle_target_cong.jpeg']), incongruent: pathJoin([image_directory, 'buch_target_incong.jpeg']), control: pathJoin([image_directory, 'sport_unrelated.jpeg'])},
]);
