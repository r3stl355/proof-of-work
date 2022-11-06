import React from "react";
import { Work, Coin } from '@daml.js/proof-of-work';
import { Popup, Label, Icon, List, Button, Modal, Input } from 'semantic-ui-react';
import { userContext } from './App';
import { CreateEvent} from "@daml/ledger";
import { ContractId } from '@daml/types';

type Props = {
  requestContracts: readonly CreateEvent<Work.Request, unknown, string>[];
  coinContractIds: ContractId<Coin.Coin>[];
  responseContracts: readonly CreateEvent<Work.Response, unknown, string>[];
};

const WorkRequestList: React.FC<Props> = ({requestContracts, coinContractIds, responseContracts}) => {

  const emptyKey = {_1: "", _2: ""};
  const emtyReponses: CreateEvent<Work.Response, unknown, string>[] = [];

  const party = userContext.useParty();
  const ledger = userContext.useLedger();
  const [response, setResponse] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newRequestOpen, setNewRequestOpen] = React.useState(false);
  const [responsesOpen, setResponsesOpen] = React.useState(false);
  const [requestResponses, setRequestResponses] = React.useState(emtyReponses);
  const [key, setKey] = React.useState(emptyKey);

  // console.log('--> Requests: ', requestContracts);
  
  const hasResponses = (key: {_1: string, _2: string}) => getRequestResponses(key).length > 0;

  const getRequestResponses = (key: {_1: string, _2: string}) => 
    responseContracts.filter(con => con.payload.requestKey._1 === key._1 && con.payload.requestKey._2 === key._2);

  const createShowResponsesHandler = (key: {_1: string, _2: string}) => {
    return async () => {
      setKey(key);
      const responses: CreateEvent<Work.Response, unknown, string>[] = getRequestResponses(key);
      setRequestResponses(responses);
      setResponsesOpen(true);
    }
  }

  const createReplyHandler = (key: {_1: string, _2: string}) => {
    return async () => {
      setKey(key);
      setNewRequestOpen(true);
    }
  }

  const createCloseHandler = (key: {_1: string, _2: string}) => {
    return async () => {
      try {
        await ledger.exerciseByKey(Work.Request.Close, key, {});
      } catch (error) {
        alert(`Error:\n${JSON.stringify(error)}`);
      }
    }
  }

  const createRejectHandler = (key: any) => {
    return async () => {
      try {
        await ledger.exerciseByKey(Work.Response.Reject, key, {});
        setResponsesOpen(false);
      } catch (error) {
        alert(`Error:\n${JSON.stringify(error)}`);
      }
    }
  }

  const createAcceptHandler = (responseKey: any) => {
    return async () => {
      try {
        const requestKey = responseKey._1;
        const keyCompare = (contractKey: any) => 
          contractKey._1 === requestKey._1 && contractKey._2 === requestKey._2;
        const request = requestContracts.filter(con => keyCompare(con.key as any));
        const reward = parseInt(request[0].payload.reward);
        const params = {"payment": [...coinContractIds].slice(0, reward)};
        await ledger.exerciseByKey(Work.Response.Accept, responseKey, params);
        setResponsesOpen(false);
      } catch (error) {
        alert(`Error:\n${JSON.stringify(error)}`);
      }
    }
  }


  const createResponse = async () => {
    try {
      if (response === "") {
        return;
      }
      setIsSubmitting(true);
      // console.log('--> Request key: ', key);
      // console.log('--> Responder: ', party);
      const params = {"responseSender": party, "responseContent": response};
      await ledger.exerciseByKey(Work.Request.CreateResponse, key, params);
      setResponse("");
      setNewRequestOpen(false);
      setKey(emptyKey);
    } catch (error) {
      alert(`Error:\n${JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <List divided selection>
        {requestContracts.map(con => 
          <List.Item key={JSON.stringify(con.key as object)} as='a'>
            <div>
              {/* <Label horizontal>
                Description
              </Label> */}
              <Popup content='Reward' 
                trigger={<Label tag><Icon name="bitcoin" size="large"></Icon>{con.payload.reward}</Label>} />
              &nbsp;
              <Popup content='Description' 
                trigger={<Label>{con.payload.content}</Label>} />
              &nbsp;
              {con.payload.sender !== party && con.payload.status === "Active" ?
                <Button color="blue" size='mini' floated="right" 
                  onClick={createReplyHandler(con.key as any)}>Reply
                </Button> :
                <>
                  <Popup content='Created by you' trigger={<Icon color='teal' size='large' name='home' />} />
                  {con.payload.status !== "Active" ?
                    <Popup content='Closed' trigger={<Icon color='red' size='large' name='cancel' />} /> :
                    <Button color="red" size='mini' floated="right" 
                      onClick={createCloseHandler(con.key as any)}>Close
                    </Button>
                  }
                  {hasResponses(con.key as any) && 
                    <Button color="teal" size='mini' floated="right" 
                      onClick={createShowResponsesHandler(con.key as any)}>Responses
                    </Button>
                  }
                </>
                // <Label color='teal' tag>requested by you</Label>
              }
            </div>
        </List.Item>
        )}
      </List>
      <Modal
        onClose={() => setNewRequestOpen(false)}
        onOpen={() => setNewRequestOpen(true)}
        open={newRequestOpen}
      >
        <Modal.Header>New Response to Work Request</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Input
              fluid
              placeholder="e.g. =3"
              value={response}
              onChange={event => setResponse(event.currentTarget.value)}
              label="Response"
              style={{paddingBottom: "5px"}}
            />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='black' onClick={() => setNewRequestOpen(false)}>Cancel</Button>
          <Button
            disabled={isSubmitting || response === ""}
            content="Create"
            positive
            onClick={createResponse}
          />
        </Modal.Actions>
      </Modal>
      <Modal
        onClose={() => setResponsesOpen(false)}
        onOpen={() => setResponsesOpen(true)}
        open={responsesOpen}
      >
        <Modal.Header>Request Responses</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <List divided selection>
              {requestResponses.map(con => 
                <List.Item key={JSON.stringify(con.key as object)} as='a'>
                  <div>
                    <Popup content='Response' 
                      trigger={<Label>{con.payload.content}</Label>} 
                    />
                    {con.payload.status === "Active" ?
                      <>
                        <Button color='teal' floated="right" 
                          onClick={createAcceptHandler(con.key as any)}>Accept
                        </Button>
                        <Button color='red' floated="right" 
                          onClick={createRejectHandler(con.key as any)}>Reject
                        </Button>
                      </> :
                      <>
                        {con.payload.status === "Accepted" ? 
                          <Popup content='Accepted' 
                            trigger={<Icon color='teal' size='large' name='thumbs up' />} 
                          /> :
                          <Popup content='Rejected' 
                            trigger={<Icon color='red' size='large' name='thumbs down' />} 
                          />
                        }
                      </>
                    }
                  </div>
              </List.Item>
              )}
            </List>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='black' onClick={() => setResponsesOpen(false)}>Close</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default WorkRequestList;
