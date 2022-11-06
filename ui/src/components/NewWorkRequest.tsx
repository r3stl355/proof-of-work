import React from 'react'
import { Input, Label, Button, Modal, Icon } from 'semantic-ui-react';
import { ContractId, Party } from '@daml/types';
import { User, Coin } from '@daml.js/proof-of-work';
import { userContext } from './App';

type Props = {
  publicParty: Party;
  coinContractIds: ContractId<Coin.Coin>[];
};


const NewWorkRequest: React.FC<Props> = ({publicParty, coinContractIds}) => {
  const party = userContext.useParty();
  const [request, setRequest] = React.useState("");
  const [reward, setReward] = React.useState("1");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const ledger = userContext.useLedger();

  const createWorkRequest = async () => {
    try {
      if (request === "" || Number.isNaN(Number.parseInt(reward))) {
        return;
      }
      const rewardVal = Number.parseInt(reward);
      if (rewardVal > coinContractIds.length) {
        throw "You don't seem to have sufficient funds to pay for this request";
      }
      setIsSubmitting(true);
      const params = {"public": publicParty, "content": request, "reward": [...coinContractIds].slice(0, rewardVal)};
      await ledger.exerciseByKey(User.User.CreateWorkRequest, party, params);
      setRequest("");
      setReward("1")
      setOpen(false);
    } catch (error) {
      alert(`Error:\n${JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button>Create Work Request</Button>}
    >
      {/* <Form onSubmit={createWorkRequest}> */}
        <Modal.Header>New Work Request</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Input
              fluid
              placeholder="e.g. 1+2"
              value={request}
              onChange={event => setRequest(event.currentTarget.value)}
              label="Description"
              style={{paddingBottom: "5px"}}
            />
            <Input 
              fluid
              labelPosition='right' 
              type='text' 
              value={reward}
              // onChange={event => {if (!Number.isNaN(Number.parseFloat(event.currentTarget.value))) setReward(event.currentTarget.value)}}
              onChange={event => {setReward(event.currentTarget.value)}}
            >
              <Label>Reward <Icon name="bitcoin"></Icon></Label>
              <input />
              <Label>.00</Label>
            </Input>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='black' onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={isSubmitting || request === ""}
            content="Create"
            positive
            onClick={createWorkRequest}
          />
        </Modal.Actions>
      {/* </Form> */}
    </Modal>
  );
};

export default NewWorkRequest;