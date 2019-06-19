import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

function FormControlLabelPosition(props) {
    const [value, setValue] = React.useState('female');

    function handleChange(event) {
        props.liveLocationHandler(event.target.checked);
        setValue(event.target.value);
    }

    return (
        <FormControl component="fieldset">
            <FormGroup aria-label="position" name="position" value={value} onChange={handleChange} row>
                <FormControlLabel
                    value="start"
                    control={<Switch color="secondary" />}
                    label="Live Tracking"
                    labelPlacement="start"
                />
            </FormGroup>
        </FormControl>
    );
}

export default FormControlLabelPosition;
